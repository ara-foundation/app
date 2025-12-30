import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "@/server-side/db"; // your mongodb client
import { createStarByUserId } from "@/server-side/star";

let authInstance: ReturnType<typeof betterAuth> | null = null;
let dbInstance: any = null;
let dbInitialized = false;

// Initialize database connection and create auth instance
async function initializeAuth() {
    if (authInstance && dbInitialized) {
        return authInstance;
    }
    
    // Ensure database is connected before creating auth instance
    if (!dbInstance) {
        dbInstance = await getDb();
        dbInitialized = true;
    }
    
    // Create auth instance with resolved database
    if (!authInstance) {
        authInstance = betterAuth({
            emailAndPassword: {
                enabled: true,
            },
            socialProviders: {
                github: {
                    clientId: process.env.AUTH_GITHUB_ID as string,
                    clientSecret: process.env.AUTH_GITHUB_SECRET as string,
                },
            },
            plugins: [
                username(),
            ],
            // Pass the resolved database instance, not a promise
            database: mongodbAdapter(dbInstance),
            databaseHooks: {
                user: {
                    create: {
                        after: async (user) => {
                            try {
                                const starId = await createStarByUserId(user.id)
                                console.log(`Star created for ${user.email} with id ${starId}`);
                            } catch (error) {
                                console.error('Error creating star on user create:', error)
                            }
                        }
                    },
                },
            },
        });
    }
    
    return authInstance;
}

// Export auth instance - will be initialized on first API call
// For server-side usage, use getAuth() instead
let _auth: ReturnType<typeof betterAuth> | null = null;

// Export a function to get the initialized auth instance
export async function getAuth() {
    return await initializeAuth();
}

// Export auth as a proxy that initializes on first use
// This allows other files to use auth.api.getSession() etc.
export const auth = {
    get api() {
        // Return a proxy that initializes auth when methods are called
        return new Proxy({} as any, {
            get(_, method) {
                return async (...args: any[]) => {
                    const instance = await initializeAuth();
                    const api = (instance as any).api;
                    const fn = api[method];
                    if (typeof fn === 'function') {
                        return fn.apply(api, args);
                    }
                    throw new Error(`Method api.${String(method)} not found`);
                };
            }
        });
    },
    handler: async (request: Request) => {
        const instance = await initializeAuth();
        return instance.handler(request);
    }
} as ReturnType<typeof betterAuth>;

