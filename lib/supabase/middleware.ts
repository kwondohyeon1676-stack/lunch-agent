import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        // 미들웨어에서는 에러를 던지기보다 로그를 남기고 다음으로 진행하거나
        // 최소한 중단되지 않게 처리합니다.
        console.error("Supabase environment variables are missing in middleware!")
        return supabaseResponse
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({
                    request,
                })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    }
    )

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This reloads the user session on the server and ensures that the
    // auth token is refreshed if it is about to expire.
    await supabase.auth.getUser()

    return supabaseResponse
}
