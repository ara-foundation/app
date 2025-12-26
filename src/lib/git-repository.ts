import { RepositoryAnalysis } from "@/types/git-repository";

// Validate Git URL
export const validateGitUrl = (url: string): string | null => {
    if (!url.trim()) {
        return 'Please enter a Git repository URL';
    }

    try {
        const normalizedUrl = url.startsWith('git@')
            ? `https://${url.replace('git@', '').replace(':', '/')}`
            : url;
        const urlObj = new URL(normalizedUrl);
        if (!urlObj.hostname.includes('github.com') && !urlObj.hostname.includes('gitlab.com')) {
            return 'Only GitHub and GitLab repositories are supported';
        }
    } catch (e) {
        return 'Invalid URL format';
    }

    return null;
};


/**
 * Fetch README content from GitHub or GitLab repository
 * @param data Repository analysis data
 * @returns Readme content as a string
 */
export const fetchReadmeContent = async (data: RepositoryAnalysis): Promise<string | null> => {
    const readmeFiles = ['README.md', 'README.txt', 'README'];
    for (const file of readmeFiles) {
        let readmeUrl = '';
        if (data.provider === 'github') {
            readmeUrl = `https://raw.githubusercontent.com/${data.owner}/${data.repo}/${data.metadata.defaultBranch}/${file}`;
        } else if (data.provider === 'gitlab') {
            const baseUrl = data.host ? `https://${data.host}` : 'https://gitlab.com';
            const encodedPath = encodeURIComponent(`${data.owner}/${data.repo}`);
            readmeUrl = `${baseUrl}/api/v4/projects/${encodedPath}/repository/files/${file}/raw?ref=${data.metadata.defaultBranch}`;
        }

        if (readmeUrl) {
            const response = await fetch(readmeUrl);
            if (response.ok) {
                const content = await response.text();
                // Limit to reasonable size (e.g., 10KB)
                if (content.length <= 10000) {
                    return content.substring(0, 10000);
                }
                return content;
            }
        }
    }

    return null;
};
