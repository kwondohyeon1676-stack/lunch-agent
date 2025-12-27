import { UserSelection, Restaurant, RecommendationResult } from "@/features/recommendation/types"
import { AI_SYSTEM_PROMPT, COMPANION_LABELS, SITUATION_LABELS, MOOD_LABELS } from "@/features/recommendation/constants"

export class OpenAIService {
    static async pickBestRestaurant(candidates: Restaurant[], selection: UserSelection): Promise<RecommendationResult> {
        // API KEY가 없으면 Mock 응답 반환
        if (!process.env.OPENAI_API_KEY) {
            return this.getMockAIResponse(candidates)
        }

        try {
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
                            content: AI_SYSTEM_PROMPT,
                        },
                        {
                            role: "user",
                            content: `상황:
- 동행인: ${COMPANION_LABELS[selection.companion || ""] || "알 수 없음"}
- 거리/상황: ${SITUATION_LABELS[selection.situation || ""] || "알 수 없음"}
- 기분/메뉴: ${MOOD_LABELS[selection.mood || ""] || "알 수 없음"}

후보 식당들:
${JSON.stringify(candidates, null, 2)}

이 중 딱 1곳을 선택하고, 센스있는 추천 코멘트와 구체적인 이유 2-3개를 작성해줘.`,
                        },
                    ],
                    temperature: 0.8,
                }),
            })

            const aiData = await response.json()

            try {
                const aiChoice = this.parseAIJSON(aiData.choices[0].message.content)
                // id가 string과 number가 섞일 수 있으므로 느슨한 비교 또는 변환 필요
                const selectedRestaurant = candidates.find((r) => r.id.toString() === aiChoice.restaurantId.toString()) || candidates[0]

                return {
                    restaurant: selectedRestaurant,
                    aiComment: aiChoice.comment,
                    aiReasons: aiChoice.reasons || []
                }
            } catch (e) {
                console.error("AI Parse Error:", e)
                return {
                    restaurant: candidates[0],
                    aiComment: "AI가 과부하로 잠시 쉬고 있네요. 그래도 여기 추천합니다!",
                    aiReasons: ["서빙이 빠름", "맛이 보장됨"]
                }
            }
        } catch (error) {
            console.error("OpenAI API call failed:", error)
            return {
                restaurant: candidates[0], // fallback
                aiComment: "AI 연결상태가 좋지 않지만, 이 집은 확실합니다!",
                aiReasons: ["여의도 직장인 성지"]
            }
        }
    }

    static async extractRestaurantInfo(text: string): Promise<any> {
        if (!process.env.OPENAI_API_KEY) {
            console.warn("NO OPENAI API KEY. Using Mock Extraction.")
            return {
                name: "테스트 식당",
                location_type: "walk",
                category: "기타",
                tags: ["제보"],
                description: text,
                price_range: "mid"
            }
        }

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
                        content: `너는 '맛집 데이터 추출기'야. 사용자의 제보 텍스트에서 식당 정보를 추출해서 JSON으로 반환해.
            
            반환 포맷:
            {
              "name": "식당 이름 (가장 정확한 상호명)",
              "location_type": "indoor" | "near" | "walk" | "taxi" 중 하나 (비올때 갈수있으면 indoor, 가까우면 near, 10분내외 walk, 멀면 taxi),
              "category": "음식 종류 (예: 한식, 일식, 중식, 양식, 카페 등)",
              "tags": ["태그1", "태그2", ...],
              "price_range": "low" | "mid" | "high" (저렴, 중간, 비쌈),
              "description": "한 줄 코멘트 (존댓말, 유머러스하게)"
            }
            
            식당 이름을 확실히 알 수 없으면 null을 반환해.`,
                    },
                    {
                        role: "user",
                        content: `제보 내용: "${text}"`,
                    },
                ],
                temperature: 0.3,
            }),
        })

        const data = await response.json()
        return this.parseAIJSON(data.choices[0].message.content)
    }

    /**
     * AI가 반환한 텍스트에서 마크다운 백틱 등을 제거하고 JSON으로 파싱합니다.
     */
    static parseAIJSON(content: string) {
        try {
            // 1. 직접 파싱 시도
            return JSON.parse(content)
        } catch (e) {
            // 2. 마크다운 백틱 제거 시도 (```json ... ```)
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
            if (jsonMatch && jsonMatch[1]) {
                try {
                    return JSON.parse(jsonMatch[1])
                } catch (e2) {
                    console.error("Failed to parse extracted JSON from markdown blocks:", e2)
                }
            }

            // 3. 백틱만 있는 경우 제거 시도
            const cleanedContent = content.replace(/```/g, "").trim()
            try {
                return JSON.parse(cleanedContent)
            } catch (e3) {
                console.error("Final JSON parse attempt failed:", e3)
                throw new Error("AI 응답 형식이 올바르지 않습니다.")
            }
        }
    }

    private static getMockAIResponse(candidates: Restaurant[]): RecommendationResult {
        const randomRestaurant = candidates[Math.floor(Math.random() * candidates.length)]
        return {
            restaurant: randomRestaurant,
            aiComment: "지금 상황에 딱 맞는 선택입니다. (AI 연결 전 Mock 응답)",
        }
    }
}

