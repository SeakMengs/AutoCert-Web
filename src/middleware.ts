import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next();
    response.headers.set("x-current-pathname", request.nextUrl.pathname);
    response.headers.set("x-full-url-pathname", request.nextUrl.href);

    if (request.method === "GET") {
        return response;
    }

    /*
     * CSRF protection. It is a must when using cookies.
     * While Next.js provides built-in CSRF protection for server actions, regular route handlers are not protected
     */
    const originHeader = request.headers.get("Origin");
    // NOTE: You may need to use `X-Forwarded-Host` instead
    const hostHeader = request.headers.get("Host");
    if (originHeader === null || hostHeader === null) {
        return new NextResponse(null, {
            status: 403,
        });
    }
    let origin: URL;
    try {
        origin = new URL(originHeader);
    } catch {
        return new NextResponse(null, {
            status: 403,
        });
    }
    if (origin.host !== hostHeader) {
        return new NextResponse(null, {
            status: 403,
        });
    }
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
