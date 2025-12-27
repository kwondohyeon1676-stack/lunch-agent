import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 간단한 In-Memory Rate Limit (Edge 환경에서는 각 인스턴스별로 동작하므로 완벽하지 않을 수 있음)
// 실제 프로덕션에서는 Redis (Upstash) 등을 사용하는 것이 권장됨.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const LIMIT = 5 // 분당 5회
const WINDOW = 60 * 1000 // 1분

export function middleware(request: NextRequest) {
    // API 요청만 제한
    if (request.nextUrl.pathname.startsWith("/api/recommend") || request.nextUrl.pathname.startsWith("/api/report")) {
        // NextRequest.ip 타입 호환성 처리
        const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "unknown"

        // 로컬호스트는 제외
        if (ip === "::1" || ip === "127.0.0.1") {
            return NextResponse.next()
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
                JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요. (편의점이 답일지도...)" }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: "/api/:path*",
}
