"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// AI를 활용한 식당 정보 보강 (네이버 검색 시뮬레이션)
export async function enrichRestaurant(id: string, restaurantName: string) {
    // 1. OpenAI로 여의도 식당 정보 추론
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `너는 여의도 맛집 전문가야. 식당 이름을 받으면 여의도 기준으로 아래 정보를 JSON으로 반환해줘.

반환 형식:
{
  "category": "한식" | "일식" | "중식" | "양식" | "카페" | "기타",
  "location_type": "indoor" | "near" | "walk" | "taxi",
  "price_range": "low" | "mid" | "high",
  "tags": ["태그1", "태그2", "태그3"],
  "waiting_info": "웨이팅/예약 정보",
  "description": "한 줄 추천 코멘트 (유머러스하게)"
}

규칙:
- location_type: 건물 내/지하=indoor, 5분 이내=near, 10분=walk, 더 멀면=taxi
- price_range: 1만원 미만=low, 1-2만원=mid, 2만원 이상=high
- tags: 3개만! 필터링에 유용한 것만 (예: 혼밥, 해장, 가성비, 웨이팅필수 등. 여의도/맛집 같은 일반적인거 금지)
- 모르는 정보는 null로`,
                },
                {
                    role: "user",
                    content: `여의도에 있는 "${restaurantName}" 식당 정보를 알려줘.`,
                },
            ],
            temperature: 0.5,
        }),
    })

    const data = await response.json()

    try {
        const { OpenAIService } = await import("@/lib/services/openai.service")
        const enrichedData = OpenAIService.parseAIJSON(data.choices[0].message.content)

        // 2. Supabase 업데이트
        const supabase = await createClient()
        const { error } = await supabase
            .from("restaurants")
            .update({
                category: enrichedData.category,
                location_type: enrichedData.location_type,
                price_range: enrichedData.price_range,
                tags: enrichedData.tags,
                waiting_info: enrichedData.waiting_info,
                description: enrichedData.description,
            })
            .eq("id", id)

        if (error) {
            console.error("Supabase update error:", error)
            return { error: "DB 업데이트 실패" }
        }

        revalidatePath("/admin")
        return { success: true, data: enrichedData }
    } catch (e) {
        console.error("AI parse error:", e)
        return { error: "AI 응답 파싱 실패" }
    }
}
