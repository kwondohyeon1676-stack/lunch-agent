"use server"

import { createClient } from "@/lib/supabase/server"
import { OpenAIService } from "@/lib/services/openai.service"

export async function submitReport(input: { text: string }) {
    const { text } = input
    console.log("[submitReport] Start with text:", text)

    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return { error: "제보 내용을 입력해주세요." }
    }

    try {
        // 1. OpenAI를 통해 비정형 텍스트 -> 정형 데이터(JSON) 변환
        console.log("[submitReport] Calling OpenAI extractRestaurantInfo...")
        const extractedData = await OpenAIService.extractRestaurantInfo(text)
        console.log("[submitReport] Extracted data:", extractedData)

        if (!extractedData || !extractedData.name) {
            console.warn("[submitReport] Extraction failed or name missing.")
            return { error: "식당 정보를 찾을 수 없습니다. 정확한 상호명을 포함해 주세요." }
        }

        const supabase = await createClient()
        console.log("[submitReport] Supabase client created.")

        // 2. 기존 식당 목록 조회 (중복 체크용)
        const { data: existingRestaurants, error: fetchError } = await supabase
            .from("restaurants")
            .select("id, name, raw_input, report_count")

        if (fetchError) {
            console.error("[submitReport] Supabase Fetch Error:", fetchError)
        }

        // 3. AI로 유사한 식당 찾기
        let duplicateId: string | null = null
        if (existingRestaurants && existingRestaurants.length > 0) {
            console.log("[submitReport] Checking duplicates among", existingRestaurants.length, "restaurants...")
            const existingNames = existingRestaurants.map(r => r.name).join(", ")

            const duplicateCheck = await checkDuplicate(extractedData.name, existingNames)
            console.log("[submitReport] Duplicate check result:", duplicateCheck)

            if (duplicateCheck.isDuplicate && duplicateCheck.matchedName) {
                const matched = existingRestaurants.find(
                    r => r.name.toLowerCase().replace(/\s/g, "") === duplicateCheck.matchedName?.toLowerCase().replace(/\s/g, "")
                )
                if (matched) {
                    duplicateId = matched.id
                    console.log("[submitReport] Found duplicate:", matched.name, "(id:", duplicateId, ")")
                }
            }
        }

        // 4. 중복이면 기존 레코드 업데이트, 아니면 새로 생성
        if (duplicateId) {
            console.log("[submitReport] Updating existing record...")
            const existing = existingRestaurants?.find(r => r.id === duplicateId)
            const newRawInput = existing?.raw_input
                ? `${existing.raw_input}\n---\n${text}`
                : text
            const newCount = (existing?.report_count || 1) + 1

            const { error } = await supabase
                .from("restaurants")
                .update({
                    raw_input: newRawInput,
                    report_count: newCount,
                })
                .eq("id", duplicateId)

            if (error) {
                console.error("[submitReport] Supabase Update Error:", error)
                return { error: "제보 저장 중 오류가 발생했습니다." }
            }

            console.log("[submitReport] Update success.")
            return {
                success: true,
                data: extractedData,
                message: `'${existing?.name}'에 대한 ${newCount}번째 제보가 추가되었습니다!`
            }
        } else {
            console.log("[submitReport] Inserting new record...")
            const { error } = await supabase.from("restaurants").insert({
                name: extractedData.name,
                location_type: extractedData.location_type || "walk",
                category: extractedData.category || "기타",
                tags: extractedData.tags || [],
                description: extractedData.description || "사용자 제보 맛집",
                waiting_info: "정보 없음",
                raw_input: text,
                status: "pending",
                report_count: 1,
            })

            if (error) {
                console.error("[submitReport] Supabase Insert Error:", error)
                return { error: "제보 저장 중 오류가 발생했습니다." }
            }

            console.log("[submitReport] Insert success.")
            return { success: true, data: extractedData }
        }
    } catch (error) {
        console.error("[submitReport] Unhandled Error:", error)
        return { error: `서버 내부 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}` }
    }
}

// AI를 사용한 중복 식당 체크
async function checkDuplicate(
    newName: string,
    existingNames: string
): Promise<{ isDuplicate: boolean; matchedName?: string }> {
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
                        content: `너는 식당 이름 비교 전문가야. 새로운 식당 이름이 기존 목록에 있는 식당과 동일한지 판단해줘.
동일한 식당의 예시:
- "니즈버거" = "니즈 버거" = "Needs버거" (띄어쓰기, 영어 표기 차이)
- "세상의모든아침" = "세상의 모든 아침" (띄어쓰기 차이)

JSON으로 반환:
{ "isDuplicate": true/false, "matchedName": "일치하는 기존 식당명 또는 null" }`,
                    },
                    {
                        role: "user",
                        content: `새 식당: "${newName}"
기존 식당 목록: ${existingNames}`,
                    },
                ],
                temperature: 0.1,
            }),
        })

        const data = await response.json()
        return OpenAIService.parseAIJSON(data.choices[0].message.content)
    } catch (e) {
        console.error("Duplicate check error:", e)
        return { isDuplicate: false }
    }
}
