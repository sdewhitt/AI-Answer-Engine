// TODO: Implement the code here to add rate limiting with Redis
// Refer to the Next.js Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
// Refer to Redis docs on Rate Limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/algorithms

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: NextRequest) {
  try {
    // Get the IP address of the requester
    const ip = request.headers.get('x-forwarded-for') || "127.0.0.1";

    // Check the rate limit
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      // If rate limit exceeded, return a 429 response
      const customResponse = {
        message: "**You have submitted too many requests. Please wait a moment and try again.**",
      };
      return new NextResponse(JSON.stringify(customResponse), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If rate limit not exceeded, proceed with the request
    return NextResponse.next();


  } catch (error) {
    console.error("Rate limiting error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
