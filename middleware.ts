import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// 간단한 In-Memory Rate Limit
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const LIMIT = 20 // 분당 20회
const WINDOW = 60 * 1000 // 1분

export async function middleware(request: NextRequest) {
    // 1. Supabase 세션 업데이트 (모든 요청에 대해 실행하여 토큰 갱신)
    // updateSession 내부에서 이미 NextResponse.next()를 기반으로 응답을 생성함
    const response = await updateSession(request)

    // 2. Rate Limiting (API 및 Server Action 보호)
    // Server Action은 POST 요청이며 'Next-Action' 헤더를 가질 수 있습니다.
    const isApiRequest = request.nextUrl.pathname.startsWith("/api/")
    const isServerAction = request.method === "POST" && (request.headers.has("next-action") || request.nextUrl.pathname === "/")

    if (isApiRequest || isServerAction) {
        // NextRequest.ip 타입 호환성 처리
        const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown"

        // 로컬호스트는 제외
        if (ip === "::1" || ip === "127.0.0.1") {
            return response
        }

        const now = Date.now()
        const userLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now }

        if (now - userLimit.lastReset > WINDOW) {
            // 시간 윈도우 지남 -> 리셋
            userLimit.count = 1
            userLimit.lastReset = now
        } else {
            // 시간 윈도우 내 -> 카운트 증가
            userLimit.count++
        }

        rateLimitMap.set(ip, userLimit)

        if (userLimit.count > LIMIT) {
            return new NextResponse(
                JSON.stringify({
                    error: "요청이 너무 많습니다. 1분 후에 다시 시도해주세요.",
                    message: "OpenAI 비용 방어를 위해 분당 5회로 제한하고 있습니다. 😊"
                }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            )
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
