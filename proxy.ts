import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from "./lib/authUtils";



export async function proxy(request: NextRequest) {


    try {
        const { pathname } = request.nextUrl
        const accessToken = request.cookies.get("accessToken")?.value
        const refreshToken = request.cookies.get("refreshToken")?.value

        const decodedAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).data;

        const isValidAccessToken = accessToken && jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string).success

        let userRole: UserRole | null = null;

        if (decodedAccessToken) {
            userRole = decodedAccessToken.role as UserRole
        }

        const routerOwner = getRouteOwner(pathname);

        const unifySuperAdminAndAdminRole = userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;

        userRole = unifySuperAdminAndAdminRole;

        const isAuth = isAuthRoute(pathname)

        if (isAuth && isValidAccessToken) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }

        if (routerOwner === null) {
            return NextResponse.next()
        }

        if (!accessToken || !isValidAccessToken) {
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("redirect", pathname)
            return NextResponse.redirect(loginUrl)
        }

        if (routerOwner === "COMMON") {
            return NextResponse.next();
        }

        if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
            if (routerOwner !== userRole) {
                return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
            }
        }


        return NextResponse.next();


    } catch (error) {
        console.log("error in proxy middleware", error);

    }


}



export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ]
}