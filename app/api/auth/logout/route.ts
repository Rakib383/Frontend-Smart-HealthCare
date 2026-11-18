import { cookies } from "next/headers"

const authCookieNames = ["accessToken", "refreshToken", "better-auth.session_token"]

export async function POST() {
  const cookieStore = await cookies()
  const cookieHeader = authCookieNames
    .map((name) => {
      const value = cookieStore.get(name)?.value
      return value ? `${name}=${value}` : null
    })
    .filter((cookie): cookie is string => cookie !== null)
    .join("; ")

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined")
    }

    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({}),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      throw new Error(`Logout endpoint returned ${response.status} ${response.statusText}`)
    }
  } catch (error: unknown) {
    console.error("Could not revoke the server session during logout:", error)
  } finally {
    for (const name of authCookieNames) {
      cookieStore.delete(name)
    }
  }

  return Response.json({ success: true })
}
