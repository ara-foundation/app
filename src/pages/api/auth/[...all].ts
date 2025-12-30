import { getAuth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
    // Initialize auth with resolved database connection
    const auth = await getAuth();
    
    // If you want to use rate limiting, make sure to set the 'x-forwarded-for' header to the request headers from the context
    // ctx.request.headers.set("x-forwarded-for", ctx.clientAddress);
    return auth.handler(ctx.request);
};