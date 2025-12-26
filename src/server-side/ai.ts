import { getCachedContext } from './ai-context-builder';

export interface GeneratedPersonalization {
    code: string;
    uris: string[];
}

export interface GeneratedGalaxy {
    name: string;
    description: string;
    tags: string[];
}

// Request tracking for debugging
let llmRequestCount = 0;
let placeholderRequestCount = 0;
let rateLimitErrorCount = 0;
const requestLog: Array<{
    requestId: number;
    timestamp: Date;
    prompt: string;
    promptLength: number;
    status: 'success' | 'error' | 'placeholder' | 'rate_limit';
    responseTime?: number;
    error?: string;
    retryAfter?: number;
}> = [];

/**
 * Get LLM request statistics
 */
export function getLLMRequestStats() {
    return {
        totalLLMRequests: llmRequestCount,
        totalPlaceholderRequests: placeholderRequestCount,
        totalRateLimitErrors: rateLimitErrorCount,
        totalRequests: llmRequestCount + placeholderRequestCount,
        recentRequests: requestLog.slice(-10), // Last 10 requests
    };
}

/**
 * Check if error is a rate limit error (429)
 */
function isRateLimitError(error: any): boolean {
    if (!error) return false;

    // Check for status code 429
    if (error.status === 429 || error.statusCode === 429) return true;

    // Check error message
    const errorMessage = error.message || String(error);
    if (errorMessage.includes('429') ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return true;
    }

    return false;
}

/**
 * Extract retry delay from rate limit error
 */
function extractRetryDelay(error: any): number | undefined {
    try {
        // Try to parse retry delay from error message
        const errorMessage = error.message || JSON.stringify(error);
        const retryMatch = errorMessage.match(/retry.*?(\d+(?:\.\d+)?)\s*s/i);
        if (retryMatch) {
            return Math.ceil(parseFloat(retryMatch[1]) * 1000); // Convert to milliseconds
        }

        // Try to parse from error details (generic format)
        if (error.details) {
            for (const detail of error.details) {
                if (detail.retryDelay) {
                    const seconds = parseFloat(detail.retryDelay);
                    return Math.ceil(seconds * 1000);
                }
            }
        }
    } catch (e) {
        // Ignore parsing errors
    }
    return undefined;
}

/**
 * Extract code from AI response (handles markdown code blocks)
 */
function extractCodeFromResponse(text: string): string {
    // Try to extract from markdown code blocks
    const codeBlockRegex = /```(?:javascript|js|typescript|ts)?\n?([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
        return match[1].trim();
    }

    // If no code block, try to find code between markers
    const codeStart = text.indexOf('```');
    if (codeStart !== -1) {
        const codeEnd = text.indexOf('```', codeStart + 3);
        if (codeEnd !== -1) {
            return text.substring(codeStart + 3, codeEnd).trim();
        }
    }

    // Fallback: return the text as-is (might be plain code)
    return text.trim();
}

/**
 * Extract URIs from AI response
 */
function extractUrisFromResponse(text: string, prompt: string): string[] {
    // Try to find JSON array of URIs
    const jsonArrayRegex = /\["([^"]+)"(?:\s*,\s*"([^"]+)")*\]/;
    const jsonMatch = text.match(jsonArrayRegex);
    if (jsonMatch) {
        const uris: string[] = [];
        for (let i = 1; i < jsonMatch.length; i++) {
            if (jsonMatch[i]) {
                uris.push(jsonMatch[i]);
            }
        }
        if (uris.length > 0) {
            return uris;
        }
    }

    // Try to find URIs list format: "URIs: /project, /all-stars"
    const urisListRegex = /(?:URIs?|uris?|applies? to):\s*([^\n]+)/i;
    const listMatch = text.match(urisListRegex);
    if (listMatch && listMatch[1]) {
        const uris = listMatch[1]
            .split(',')
            .map(uri => uri.trim())
            .filter(uri => uri.startsWith('/'));
        if (uris.length > 0) {
            return uris;
        }
    }

    // Fallback: extract from prompt
    const uris: string[] = [];
    if (prompt.toLowerCase().includes('project')) {
        uris.push('/project');
    }
    if (prompt.toLowerCase().includes('all-stars') || prompt.toLowerCase().includes('all stars')) {
        uris.push('/all-stars');
    }
    if (uris.length === 0) {
        uris.push('/project');
        uris.push('/all-stars');
    }

    return uris;
}

/**
 * Extract JSON object from AI response
 */
function extractJsonFromResponse(text: string): any | null {
    // Try to find JSON object
    const jsonObjectRegex = /\{[\s\S]*\}/;
    const jsonMatch = text.match(jsonObjectRegex);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // Not valid JSON
        }
    }
    return null;
}

/**
 * Fallback placeholder logic (used when API fails)
 */
function generatePlaceholderCode(prompt: string): GeneratedPersonalization {
    const uris: string[] = [];
    if (prompt.toLowerCase().includes('project')) {
        uris.push('/project');
    }
    if (prompt.toLowerCase().includes('all-stars') || prompt.toLowerCase().includes('all stars')) {
        uris.push('/all-stars');
    }
    if (uris.length === 0) {
        uris.push('/project');
        uris.push('/all-stars');
    }

    // Simple zoom detection
    if (prompt.toLowerCase().includes('zoom')) {
        const zoomMatch = prompt.match(/(\d+)%/);
        const defaultZoom = zoomMatch ? parseInt(zoomMatch[1]) : 50;
        return {
            code: `setZoom(${defaultZoom});`,
            uris,
        };
    }

    return {
        code: `// Generated code for: ${prompt}\n// TODO: Implement based on prompt\nconsole.log('Personalization applied:', '${prompt}');`,
        uris,
    };
}

/**
 * Extract project name from README content
 */
function extractProjectNameFromReadme(readmeContent: string, gitUrl?: string): string | null {
    if (!readmeContent) return null;

    // Look for common patterns in README
    const patterns = [
        /^#\s+(.+)$/m, // # Project Name
        /^##\s+(.+)$/m, // ## Project Name
        /^# (.+)$/m, // # Project Name (alternative)
        /title[:\s]+(.+)/i, // title: Project Name
        /name[:\s]+(.+)/i, // name: Project Name
        /^(.+?)\s+[-–—]\s+/m, // Project Name - Description
    ];

    for (const pattern of patterns) {
        const match = readmeContent.match(pattern);
        if (match && match[1]) {
            const name = match[1].trim();
            // Filter out common non-name patterns
            if (name.length > 2 && name.length < 100 &&
                !name.toLowerCase().includes('readme') &&
                !name.toLowerCase().includes('license') &&
                !name.toLowerCase().includes('contributing')) {
                return name;
            }
        }
    }

    return null;
}

/**
 * Format repository name from Git URL to readable name
 */
function formatRepoNameFromUrl(gitUrl: string): string {
    try {
        // Extract repo name from URL
        let repoName = '';

        // Handle different URL formats
        if (gitUrl.includes('github.com') || gitUrl.includes('gitlab.com')) {
            // Extract from https://github.com/owner/repo or git@github.com:owner/repo
            const match = gitUrl.match(/(?:github\.com|gitlab\.com)[\/:]([^\/]+)\/([^\/\.]+)/);
            if (match && match[2]) {
                repoName = match[2];
            }
        } else {
            // Fallback: try to extract last part of URL
            const parts = gitUrl.split('/');
            repoName = parts[parts.length - 1] || '';
        }

        // Remove .git suffix if present
        repoName = repoName.replace(/\.git$/, '');

        if (!repoName) return 'Untitled Project';

        // Convert to readable format:
        // 1. Split camelCase into words first (before replacing underscores/hyphens)
        repoName = repoName.replace(/([a-z])([A-Z])/g, '$1 $2');

        // 2. Replace underscores and hyphens with spaces
        repoName = repoName.replace(/[_-]/g, ' ');

        // 3. Clean up multiple spaces and trim
        repoName = repoName.replace(/\s+/g, ' ').trim();

        // 4. Capitalize first letter of each word
        repoName = repoName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return repoName.trim() || 'Untitled Project';
    } catch (error) {
        console.error('Error formatting repo name from URL:', error);
        return 'Untitled Project';
    }
}

/**
 * Fallback placeholder logic for galaxy generation
 */
function generatePlaceholderGalaxy(readmeContent: string, projectMetadata: any, gitUrl?: string): GeneratedGalaxy {
    // Try to extract name from README first
    let name = extractProjectNameFromReadme(readmeContent, gitUrl);

    // If not found in README, try metadata
    if (!name) {
        name = projectMetadata?.name || projectMetadata?.repo || null;
    }

    // If still not found, format from Git URL
    if (!name && gitUrl) {
        name = formatRepoNameFromUrl(gitUrl);
    }

    // Final fallback
    if (!name) {
        name = 'Untitled Project';
    }

    // Extract description from README (max 200 chars)
    let description = readmeContent.substring(0, 200).trim();
    if (readmeContent.length > 200) {
        description = description.substring(0, description.lastIndexOf(' ')) + '...';
    }
    if (!description) {
        description = 'An open-source project';
    }

    // Generate basic tags
    const tags: string[] = [];

    // Language/framework tag (from metadata or infer from README)
    if (projectMetadata?.language) {
        tags.push(projectMetadata.language);
    } else if (readmeContent.toLowerCase().includes('typescript')) {
        tags.push('TypeScript');
    } else if (readmeContent.toLowerCase().includes('javascript')) {
        tags.push('JavaScript');
    } else if (readmeContent.toLowerCase().includes('python')) {
        tags.push('Python');
    } else if (readmeContent.toLowerCase().includes('rust')) {
        tags.push('Rust');
    } else {
        tags.push('Open Source');
    }

    // Target users tag
    if (readmeContent.toLowerCase().includes('developer')) {
        tags.push('Developers');
    } else if (readmeContent.toLowerCase().includes('user')) {
        tags.push('Users');
    } else {
        tags.push('Community');
    }

    // Pain point tag
    tags.push('Problem Solving');

    // Solution tag
    tags.push('Innovation');

    return {
        name,
        description,
        tags: tags.slice(0, 4), // Ensure at least 4 tags
    };
}

/**
 * Generate code and URIs from user prompt using Hugging Face Inference API (free tier, no credit card required)
 */
export async function generateCode(params: {
    prompt: string;
    context: string;
    componentStructure: string[];
}): Promise<GeneratedPersonalization> {
    const { prompt, componentStructure } = params;

    // Check for API key
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const requestId = llmRequestCount + placeholderRequestCount + 1;
    const startTime = Date.now();

    if (!apiKey) {
        placeholderRequestCount++;
        const logEntry = {
            requestId,
            timestamp: new Date(),
            prompt,
            promptLength: prompt.length,
            status: 'placeholder' as const,
        };
        requestLog.push(logEntry);
        if (requestLog.length > 100) {
            requestLog.shift(); // Keep only last 100 requests
        }

        console.warn(`[LLM Debug] Request #${requestId}: HUGGINGFACE_API_KEY not set, using placeholder logic`);
        console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Total: ${llmRequestCount + placeholderRequestCount}`);
        return generatePlaceholderCode(prompt);
    }

    try {
        llmRequestCount++;
        console.log(`[LLM Debug] Request #${requestId}: Starting LLM API call`);
        console.log(`[LLM Debug] Request #${requestId}: Prompt length: ${prompt.length} characters`);
        console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Total: ${llmRequestCount + placeholderRequestCount}`);

        // Get cached context (built once, reused for all requests)
        const cachedContext = getCachedContext();
        const contextLength = cachedContext.length;
        console.log(`[LLM Debug] Request #${requestId}: Context length: ${contextLength} characters`);

        // Construct the prompt with system instructions and user request
        const systemMessage = `You are a code generator for React component personalization. You generate JavaScript code that personalizes UI components based on user requests. The code you generate will be executed in a controlled environment with access to specific state variables and setters. Always generate valid, executable JavaScript code.`;

        const userMessage = `${cachedContext}

---

## User Request

${prompt}

## Task

Generate JavaScript code that personalizes the GalaxyLayoutBody component based on the user's request above. 

**Requirements:**
1. Generate valid JavaScript code that can be executed in the component's execution context
2. The code should directly manipulate state using the available setters (e.g., setZoom, setShowDialog, etc.)
3. **IMPORTANT: Do NOT declare variables with names that already exist in the context** (zoom, showDialog, virtualScreenSize, isAllStarsPage, projectId, projectName, initialZoom, minZoom, maxZoom, maxGalaxyContent, window, location, etc.). Use unique variable names for any new variables you create.
4. Extract or infer URIs from the prompt that indicate where this personalization should apply
5. Return the code in a markdown code block (\`\`\`javascript)
6. List the URIs either as a JSON array or in the format "URIs: /path1, /path2"

**Response Format:**
\`\`\`javascript
// Your generated code here
\`\`\`

URIs: /project, /all-stars
`;

        const fullPromptLength = userMessage.length;
        console.log(`[LLM Debug] Request #${requestId}: Full prompt length: ${fullPromptLength} characters`);
        console.log(`[LLM Debug] Request #${requestId}: Calling Hugging Face API with model: meta-llama/Meta-Llama-3-8B-Instruct`);

        // Call Hugging Face Router API (free tier, no credit card required)
        // Using new router endpoint with OpenAI-compatible format
        const apiCallStartTime = Date.now();

        const apiResponse = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: systemMessage,
                    },
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Hugging Face API error (${apiResponse.status}): ${errorText}`);
        }

        const apiData = await apiResponse.json();
        const apiCallEndTime = Date.now();
        const apiResponseTime = apiCallEndTime - apiCallStartTime;

        // Hugging Face router returns OpenAI-compatible format
        const responseText = apiData.choices?.[0]?.message?.content || '';
        const responseLength = responseText.length;

        console.log(`[LLM Debug] Request #${requestId}: API response received in ${apiResponseTime}ms`);
        console.log(`[LLM Debug] Request #${requestId}: Response length: ${responseLength} characters`);

        if (!responseText) {
            placeholderRequestCount++;
            const logEntry = {
                requestId,
                timestamp: new Date(),
                prompt,
                promptLength: prompt.length,
                status: 'error' as const,
                responseTime: apiResponseTime,
                error: 'Empty response from Hugging Face API',
            };
            requestLog.push(logEntry);
            if (requestLog.length > 100) {
                requestLog.shift();
            }

            console.error(`[LLM Debug] Request #${requestId}: Empty response from Hugging Face API, using placeholder`);
            console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Total: ${llmRequestCount + placeholderRequestCount}`);
            return generatePlaceholderCode(prompt);
        }

        // Extract code and URIs
        const code = extractCodeFromResponse(responseText);
        const uris = extractUrisFromResponse(responseText, prompt);

        if (!code || code.length === 0) {
            placeholderRequestCount++;
            const logEntry = {
                requestId,
                timestamp: new Date(),
                prompt,
                promptLength: prompt.length,
                status: 'error' as const,
                responseTime: apiResponseTime,
                error: 'No code extracted from Hugging Face response',
            };
            requestLog.push(logEntry);
            if (requestLog.length > 100) {
                requestLog.shift();
            }

            console.error(`[LLM Debug] Request #${requestId}: No code extracted from Hugging Face response, using placeholder`);
            console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Total: ${llmRequestCount + placeholderRequestCount}`);
            return generatePlaceholderCode(prompt);
        }

        const totalTime = Date.now() - startTime;
        const logEntry = {
            requestId,
            timestamp: new Date(),
            prompt,
            promptLength: prompt.length,
            status: 'success' as const,
            responseTime: totalTime,
        };
        requestLog.push(logEntry);
        if (requestLog.length > 100) {
            requestLog.shift();
        }

        console.log(`[LLM Debug] Request #${requestId}: Successfully generated code in ${totalTime}ms (API: ${apiResponseTime}ms)`);
        console.log(`[LLM Debug] Request #${requestId}: Generated code length: ${code.length} characters, URIs: ${uris.length}`);
        console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Total: ${llmRequestCount + placeholderRequestCount}`);

        return {
            code: code.trim(),
            uris,
        };
    } catch (error) {
        placeholderRequestCount++;
        const totalTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRateLimit = isRateLimitError(error);
        const retryAfter = isRateLimit ? extractRetryDelay(error) : undefined;

        if (isRateLimit) {
            rateLimitErrorCount++;
            console.error(`[LLM Debug] Request #${requestId}: ⚠️ RATE LIMIT ERROR (429) - Quota exceeded`);
            console.error(`[LLM Debug] Request #${requestId}: Error details:`, errorMessage.substring(0, 500));
            if (retryAfter) {
                const retryAfterSeconds = Math.ceil(retryAfter / 1000);
                console.error(`[LLM Debug] Request #${requestId}: Retry after: ${retryAfterSeconds} seconds (${Math.ceil(retryAfterSeconds / 60)} minutes)`);
            }
            console.error(`[LLM Debug] Request #${requestId}: Free tier quota limits:`);
            console.error(`  - Input tokens per minute: EXCEEDED`);
            console.error(`  - Requests per minute: EXCEEDED`);
            console.error(`  - Requests per day: EXCEEDED`);
            console.error(`[LLM Debug] Request #${requestId}: Falling back to placeholder logic`);
            console.error(`[LLM Debug] Request #${requestId}: To fix: Wait for quota reset or upgrade your plan`);
            console.error(`[LLM Debug] Request #${requestId}: Monitor usage: https://ai.dev/usage?tab=rate-limit`);

            const logEntry = {
                requestId,
                timestamp: new Date(),
                prompt,
                promptLength: prompt.length,
                status: 'rate_limit' as const,
                responseTime: totalTime,
                error: `Rate limit (429): ${errorMessage.substring(0, 200)}`,
                retryAfter,
            };
            requestLog.push(logEntry);
            if (requestLog.length > 100) {
                requestLog.shift();
            }
        } else {
            const logEntry = {
                requestId,
                timestamp: new Date(),
                prompt,
                promptLength: prompt.length,
                status: 'error' as const,
                responseTime: totalTime,
                error: errorMessage,
            };
            requestLog.push(logEntry);
            if (requestLog.length > 100) {
                requestLog.shift();
            }

            console.error(`[LLM Debug] Request #${requestId}: Error calling Hugging Face API after ${totalTime}ms:`, error);
        }

        console.log(`[LLM Stats] Total LLM requests: ${llmRequestCount}, Placeholder requests: ${placeholderRequestCount}, Rate limit errors: ${rateLimitErrorCount}, Total: ${llmRequestCount + placeholderRequestCount}`);
        // Fallback to placeholder logic
        return generatePlaceholderCode(prompt);
    }
}

/**
 * Generate galaxy name, description, and tags from README and project metadata
 */
export async function generateGalaxy(params: {
    readmeContent: string;
    projectMetadata: {
        name?: string;
        repo?: string;
        language?: string;
        description?: string;
        [key: string]: any;
    };
    gitUrl?: string;
}): Promise<GeneratedGalaxy> {
    const { readmeContent, projectMetadata, gitUrl } = params;

    // Check for API key
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    const requestId = llmRequestCount + placeholderRequestCount + 1;
    const startTime = Date.now();

    // Limit README content to 200 characters for description
    const limitedReadme = readmeContent.substring(0, 200).trim();

    if (!apiKey) {
        placeholderRequestCount++;
        const logEntry = {
            requestId,
            timestamp: new Date(),
            prompt: 'Generate galaxy from README',
            promptLength: limitedReadme.length,
            status: 'placeholder' as const,
        };
        requestLog.push(logEntry);
        if (requestLog.length > 100) {
            requestLog.shift();
        }

        console.warn(`[LLM Debug] Request #${requestId}: HUGGINGFACE_API_KEY not set, using placeholder logic for galaxy generation`);
        return generatePlaceholderGalaxy(readmeContent, projectMetadata, gitUrl);
    }

    try {
        llmRequestCount++;
        console.log(`[LLM Debug] Request #${requestId}: Starting LLM API call for galaxy generation`);
        console.log(`[LLM Debug] Request #${requestId}: README length: ${readmeContent.length} characters (limited to 200 for description)`);

        const systemMessage = `You are an AI assistant that analyzes open-source projects and generates appropriate names, descriptions, and tags for galaxy representations. A galaxy represents an open-source project in the Ara platform.`;

        // Extract project name from README or format from Git URL
        const extractedName = extractProjectNameFromReadme(readmeContent, gitUrl);
        const formattedRepoName = gitUrl ? formatRepoNameFromUrl(gitUrl) : null;
        const suggestedName = extractedName || formattedRepoName || projectMetadata.name || projectMetadata.repo || 'Unknown';

        const userMessage = `Analyze the following project information and generate a galaxy representation:

## Project Metadata
- Git URL: ${gitUrl || 'N/A'}
- Repository: ${projectMetadata.repo || 'Unknown'}
- Suggested Name: ${suggestedName}
- Language: ${projectMetadata.language || 'Unknown'}
- Description: ${projectMetadata.description || 'N/A'}

## README Content (first 200 characters)
${limitedReadme}

## Task

Generate a JSON object with the following structure:
\`\`\`json
{
  "name": "Project Name (short, descriptive)",
  "description": "Brief description (max 200 characters, based on README)",
  "tags": [
    "language-or-framework-tag",
    "target-users-tag",
    "pain-point-tag",
    "solution-tag"
  ]
}
\`\`\`

**Requirements:**
1. **Name**: Short, descriptive name for the project. Priority:
   - First, try to find the project name mentioned in the README content
   - If not found, use the suggested name based on Git URL (formatted from repository name)
   - The name should be clear, readable, and properly formatted (spaces instead of underscores, hyphens, or camelCase)
2. **Description**: Maximum 200 characters, extracted/summarized from README content. Should be clear and informative.
3. **Tags**: Exactly 4 tags minimum:
   - At least one tag for the project's language or framework (e.g., "TypeScript", "React", "Python", "Rust")
   - At least one tag for target users (e.g., "Developers", "Users", "Community", "Enterprises")
   - At least one tag for pain point (e.g., "Problem Solving", "Efficiency", "Security", "Scalability")
   - At least one tag for solution (e.g., "Innovation", "Automation", "Tool", "Library")

**Response Format:**
Return only valid JSON, no additional text.`;

        const apiCallStartTime = Date.now();

        const apiResponse = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                messages: [
                    {
                        role: 'system',
                        content: systemMessage,
                    },
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
                max_tokens: 512,
                temperature: 0.7,
            }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Hugging Face API error (${apiResponse.status}): ${errorText}`);
        }

        const apiData = await apiResponse.json();
        const apiCallEndTime = Date.now();
        const apiResponseTime = apiCallEndTime - apiCallStartTime;

        const responseText = apiData.choices?.[0]?.message?.content || '';
        console.log(`[LLM Debug] Request #${requestId}: API response received in ${apiResponseTime}ms`);

        if (!responseText) {
            placeholderRequestCount++;
            console.error(`[LLM Debug] Request #${requestId}: Empty response from Hugging Face API, using placeholder`);
            return generatePlaceholderGalaxy(readmeContent, projectMetadata, gitUrl);
        }

        // Try to extract JSON from response
        const jsonData = extractJsonFromResponse(responseText);
        if (jsonData && jsonData.name && jsonData.description && Array.isArray(jsonData.tags)) {
            // Ensure description is max 200 chars
            const description = jsonData.description.substring(0, 200).trim();

            // Ensure at least 4 tags
            const tags = jsonData.tags.length >= 4 ? jsonData.tags.slice(0, 4) : [...jsonData.tags, ...generatePlaceholderGalaxy(readmeContent, projectMetadata, gitUrl).tags].slice(0, 4);

            const totalTime = Date.now() - startTime;
            const logEntry = {
                requestId,
                timestamp: new Date(),
                prompt: 'Generate galaxy from README',
                promptLength: limitedReadme.length,
                status: 'success' as const,
                responseTime: totalTime,
            };
            requestLog.push(logEntry);
            if (requestLog.length > 100) {
                requestLog.shift();
            }

            console.log(`[LLM Debug] Request #${requestId}: Successfully generated galaxy in ${totalTime}ms (API: ${apiResponseTime}ms)`);
            return {
                name: jsonData.name,
                description,
                tags,
            };
        }

        // If JSON extraction failed, use placeholder
        placeholderRequestCount++;
        console.error(`[LLM Debug] Request #${requestId}: Failed to extract valid JSON from response, using placeholder`);
        return generatePlaceholderGalaxy(readmeContent, projectMetadata, gitUrl);
    } catch (error) {
        placeholderRequestCount++;
        const totalTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRateLimit = isRateLimitError(error);

        if (isRateLimit) {
            rateLimitErrorCount++;
            console.error(`[LLM Debug] Request #${requestId}: ⚠️ RATE LIMIT ERROR (429) - Quota exceeded`);
        } else {
            console.error(`[LLM Debug] Request #${requestId}: Error calling Hugging Face API after ${totalTime}ms:`, error);
        }

        // Fallback to placeholder logic
        return generatePlaceholderGalaxy(readmeContent, projectMetadata, gitUrl);
    }
}

