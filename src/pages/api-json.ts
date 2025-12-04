import type { APIRoute } from 'astro'
import { isWishlisted, joinWishlist } from '../scripts/wishlist'
import { sleep } from '../lib/utils'

const secretKey = import.meta.env.TURNSTYLE_SECRET_KEY;

interface JSONRPCRequest {
    jsonrpc: string
    method: string
    params: {
        [key: string]: any
    }
    id: number | string | null
}

interface JSONRPCResponse {
    jsonrpc: string
    result?: any
    error?: {
        code: number
        message: string
        data?: any
    }
    id: number | string | null
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

async function handleJoinWishlist(params: { email?: string, recaptchaToken?: string, action: 'hero' | 'join-us' }): Promise<{ success: boolean; message: string }> {
    if (!params.recaptchaToken) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'Recaptcha token is required'
        }
    }

    let result: any;
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: JSON.stringify({
                secret: secretKey,
                response: params.recaptchaToken,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        result = await response.json();
    } catch (error) {
        console.error('Error verifying recaptcha token', error);
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'Error verifying recaptcha token'
        }
    }

    // Check if the token is valid.
    if (!result.success) {
        console.log('Invalid token:', result['error-codes']);

        throw {
            code: -32602,
            message: 'Invalid params',
            data: result['error-codes'].join(', ')
        }
    }

    console.log(`Bot protection was successful, join to wishlist`)

    return await handleJoinWishlistUnsafe(params)
}

async function handleJoinWishlistUnsafe(params: { email?: string, action: 'hero' | 'join-us' }): Promise<{ success: boolean; message: string }> {
    if (!params.email) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'Email parameter is required'
        }
    }

    if (!validateEmail(params.email)) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'Invalid email format'
        }
    }

    if (!params.action) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'Recaptcha action is required'
        }
    }


    const wishlisted = await isWishlisted(params.email)
    if (wishlisted) {
        throw {
            code: -32603,
            message: 'Duplicate request',
            data: 'Email already in wishlist'
        }
    }

    const success = await joinWishlist(params.email)
    if (!success) {
        throw {
            code: -32603,
            message: 'Internal error',
            data: 'Failed to join wishlist'
        }
    }

    return {
        success: true,
        message: 'Successfully joined wishlist'
    }
}

async function handleUpdateProjectVersionStatus(params: { projectId?: string, currentStatus?: 'planned' | 'active' | 'completed', completedIssues?: number, totalIssues?: number }): Promise<{ status: 'planned' | 'active' | 'completed', completedIssues: number, totalIssues: number }> {
    if (!params.projectId) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'projectId is required'
        }
    }

    if (!params.currentStatus) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'currentStatus is required'
        }
    }

    // Sleep for 1 second to simulate server delay
    await sleep(1000)

    // Determine new status based on transition rules
    let newStatus: 'planned' | 'active' | 'completed'
    switch (params.currentStatus) {
        case 'planned':
            newStatus = 'active'
            break
        case 'active':
            newStatus = 'completed'
            break
        case 'completed':
            newStatus = 'completed' // No change
            break
        default:
            throw {
                code: -32602,
                message: 'Invalid params',
                data: 'Invalid currentStatus value'
            }
    }

    // Calculate new issue counts based on transition
    let completedIssues = params.completedIssues ?? 0
    let totalIssues = params.totalIssues ?? 0

    if (params.currentStatus === 'active' && newStatus === 'completed') {
        // When completing, mark all remaining issues as completed
        completedIssues = totalIssues
    } else if (params.currentStatus === 'planned' && newStatus === 'active') {
        // When activating, keep the same counts (or they could be initialized from the issues array)
        // For now, we'll keep them as is
    }
    // For completed status, no change needed

    return {
        status: newStatus,
        completedIssues,
        totalIssues
    }
}

async function handleRevertPatch(params: { projectId?: string, version?: string, issueId?: string }): Promise<{ success: boolean, message: string }> {
    if (!params.projectId) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'projectId is required'
        }
    }

    if (!params.version) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'version is required'
        }
    }

    if (!params.issueId) {
        throw {
            code: -32602,
            message: 'Invalid params',
            data: 'issueId is required'
        }
    }

    // Sleep for 1 second to simulate server delay
    await sleep(1000)

    return {
        success: true,
        message: 'Patch reverted successfully'
    }
}

export const POST: APIRoute = async ({ request }) => {
    console.log('api-json POST request')
    try {
        // Parse JSON-RPC request
        const body: JSONRPCRequest = await request.json()

        // Validate JSON-RPC structure
        if (body.jsonrpc !== '2.0') {
            return new Response(
                JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message: 'Invalid Request',
                        data: 'jsonrpc must be "2.0"'
                    },
                    id: body.id ?? null
                } as JSONRPCResponse),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        }

        if (!body.method) {
            return new Response(
                JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message: 'Invalid Request',
                        data: 'method is required'
                    },
                    id: body.id ?? null
                } as JSONRPCResponse),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
        }

        // Handle different methods
        let result: any

        switch (body.method) {
            case 'joinwishlist-unsafe':
                try {
                    result = await handleJoinWishlistUnsafe(body.params as { email?: string, action: 'hero' | 'join-us' })
                } catch (error: any) {
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: error.code || -32603,
                                message: error.message || 'Internal error',
                                data: error.data
                            },
                            id: body.id ?? null
                        } as JSONRPCResponse),
                        {
                            status: 200, // JSON-RPC errors still return 200
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                }
                break
            case 'joinwishlist':
                try {
                    result = await handleJoinWishlist(body.params as { email?: string, recaptchaToken?: string, action: 'hero' | 'join-us' })
                } catch (error: any) {
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: error.code || -32603,
                                message: error.message || 'Internal error',
                                data: error.data
                            },
                            id: body.id ?? null
                        } as JSONRPCResponse),
                        {
                            status: 200, // JSON-RPC errors still return 200
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                }
                break
            case 'updateProjectVersionStatus':
                try {
                    result = await handleUpdateProjectVersionStatus(body.params)
                } catch (error: any) {
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: error.code || -32603,
                                message: error.message || 'Internal error',
                                data: error.data
                            },
                            id: body.id ?? null
                        } as JSONRPCResponse),
                        {
                            status: 200, // JSON-RPC errors still return 200
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                }
                break
            case 'revert-patch':
                try {
                    result = await handleRevertPatch(body.params as { projectId?: string, version?: string, issueId?: string })
                } catch (error: any) {
                    return new Response(
                        JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: error.code || -32603,
                                message: error.message || 'Internal error',
                                data: error.data
                            },
                            id: body.id ?? null
                        } as JSONRPCResponse),
                        {
                            status: 200, // JSON-RPC errors still return 200
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                }
                break

            default:
                return new Response(
                    JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32601,
                            message: 'Method not found',
                            data: `Method "${body.method}" is not supported`
                        },
                        id: body.id ?? null
                    } as JSONRPCResponse),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
        }

        // Return success response
        return new Response(
            JSON.stringify({
                jsonrpc: '2.0',
                result,
                id: body.id ?? null
            } as JSONRPCResponse),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    } catch (error: any) {
        // Handle parsing errors or other unexpected errors
        return new Response(
            JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32700,
                    message: 'Parse error',
                    data: error.message || 'Invalid JSON'
                },
                id: null
            } as JSONRPCResponse),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}

