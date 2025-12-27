import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "제보 내용을 입력해주세요." }, { status: 400 })
    }

    // OpenAI를 통해 비정형 텍스트 -> 정형 데이터(JSON) 변환
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const aiData = await aiResponse.json()
    const extractedData = JSON.parse(aiData.choices[0].message.content)

    if (!extractedData || !extractedData.name) {
      return NextResponse.json(
        { error: "식당 정보를 찾을 수 없습니다. 정확한 상호명을 포함해 주세요." },
        { status: 400 },
      )
    }

    // Supabase 저장
    const supabase = await createClient()
    const { error } = await supabase.from("restaurants").insert({
      name: extractedData.name,
      location_type: extractedData.location_type || "walk",
      category: extractedData.category || "기타",
      price_range: extractedData.price_range || "mid",
      tags: extractedData.tags || [],
      description: extractedData.description || "사용자 제보 맛집",
      raw_input: text,
      status: "pending", // 승인 대기
    })

    if (error) {
      console.error("Supabase Insert Error:", error)
      return NextResponse.json({ error: "제보 저장 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: extractedData })
  } catch (error) {
    console.error("Report APi Error:", error)
    return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 })
  }
}
