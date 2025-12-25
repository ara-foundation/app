import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins"
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb } from "@/server-side/db"; // your mongodb client
import { createStarByUserId } from "@/server-side/star";

export const auth = betterAuth({
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
    database: mongodbAdapter(await getDb()),
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
    }
});

