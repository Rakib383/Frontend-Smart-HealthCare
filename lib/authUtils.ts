
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";


export const authRoutes = ["login","register","forget-password","reset-password","verify-email"]

export const isAuthRoute = (pathname:string) => {

    return authRoutes.some((route:string) => route === pathname)
}

export type RouteConfig = {
    exact:string[],
    pattern:RegExp[]
}

export const commonProtectedRoutes :RouteConfig = {
    exact:["/my-profile","/change-password"],
    pattern:[]
}

export const patientProtectedRoutes:RouteConfig = {
    pattern:[/^\/dashboard/ ],
    exact:["/payment/success"]

}

export const doctorProtectedRoutes:RouteConfig = {
    pattern: [/^\/doctor\/dashboard/],
    exact:[]
}

export const adminOrSuperAdminProtectedRoutes:RouteConfig = {
    pattern: [/^\/admin\/dashboard/],
    exact:[]
}

export const isRouteMatches = (pathname:string,routes:RouteConfig) => {

    if(routes.exact.includes(pathname)) {
        return true
    }

    return routes.pattern.some((pattern) => pattern.test(pathname))

}

export const getRouteOwner = (pathname:string) :  "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {

    if(isRouteMatches(pathname,doctorProtectedRoutes)) {
        return "DOCTOR"
    }
    if(isRouteMatches(pathname,adminOrSuperAdminProtectedRoutes)) {
        return "ADMIN"
    }
    if(isRouteMatches(pathname,patientProtectedRoutes)) {
        return "PATIENT"
    }
    if(isRouteMatches(pathname,commonProtectedRoutes)) {
        return "COMMON"
    }
    return null;
}

export const getDefaultDashboardRoute = (role:UserRole) => {
    if(role === "ADMIN" || role === "SUPER_ADMIN") {
        return "/admin/dashboard"
    }
    if(role === "DOCTOR") {
        return "/doctor/dashboard"
    }
    if(role === "PATIENT") {
        return "/dashboard"
    }

    return "/"
}

export const isValidRedirectForRole = (redirectPath:string,role:UserRole) => {

    const unifySuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;

    role = unifySuperAdminAndAdminRole;

    const routeOwner = getRouteOwner(redirectPath)

    if(routeOwner === null || routeOwner === "COMMON") {
        return true
    }

    if(routeOwner === role) {
        return true
    }

    return false;
}