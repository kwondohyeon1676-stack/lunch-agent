import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

type Selection = {
  building?: string
  companion?: string
  situation?: string
  mood?: string
}

export async function POST(request: NextRequest) {
  try {
    const selection: Selection = await request.json()

    let finalCandidates: any[] = []
    let useMockAI = false

    // 1단계: Supabase Query (DB 연결 시도)
    try {
      const supabase = await createClient()

      let query = supabase.from("restaurants").select("*")

      // 거리 필터링
      if (selection.situation === "indoor") {
        query = query.eq("location_type", "indoor")
      } else if (selection.situation === "quick") {
        query = query.in("location_type", ["indoor", "near"])
      } else if (selection.situation === "walk") {
        query = query.in("location_type", ["indoor", "near", "walk"])
      }

      // 가격 필터링
      if (selection.mood === "expensive") {
        query = query.eq("price_range", "high")
      } else if (selection.mood === "diet") {
        query = query.contains("tags", ["다이어트"])
      }

      const { data, error } = await query

      if (error) throw error
      if (data) finalCandidates = data
    } catch (e) {
      console.log("DB Connection failed or no data, switching to Mock Mode")
    }

    // [Mock Data Fallback] DB 데이터가 없으면 가짜 데이터 사용
    if (finalCandidates.length === 0) {
      useMockAI = true // DB가 없으면 AI도 보통 안됨 (API Key 없을 확률 높음)
      finalCandidates = [
        {
          id: 1,
          name: "오복수산",
          location_type: "indoor",
          category: "일식",
          price_range: "mid",
          tags: ["카이센동", "깔끔", "데이트"],
          description: "신선한 해산물이 듬뿍, 점심부터 호강하는 맛",
        },
        {
          id: 2,
          name: "진주집",
          location_type: "walk",
          category: "한식",
          price_range: "mid",
          tags: ["콩국수", "웨이팅", "여의도명물"],
          description: "여의도 직장인들의 소울푸드, 줄 서도 먹어야 함",
        },
        {
          id: 3,
          name: "세상의모든아침",
          location_type: "indoor",
          category: "양식",
          price_range: "high",
          tags: ["뷰맛집", "브런치", "법카"],
          description: "50층 뷰와 함께 즐기는 우아한 브런치",
        },
        {
          id: 4,
          name: "동해도",
          location_type: "near",
          category: "일식",
          price_range: "mid",
          tags: ["회전초밥", "가성비", "무한리필"],
          description: "접시 쌓는 재미가 있는 회전초밥",
        },
        {
          id: 5,
          name: "바스버거",
          location_type: "near",
          category: "양식",
          price_range: "low",
          tags: ["수제버거", "맥주무한", "자유분방"],
          description: "감자칩 무한리필에 힙한 수제버거 맛집",
        }
      ]
    }

    // 만약 필터링 후에도 후보가 없다면 (Mock 데이터 중에서도 필터링 필요하다면 로직 추가 가능하지만, P0에선 생략)
    if (!finalCandidates || finalCandidates.length === 0) {
      return NextResponse.json({ error: "조건에 맞는 식당을 찾을 수 없습니다" }, { status: 404 })
    }

    // 2단계: AI Selection
    // API KEY가 없거나 Mock Mode인 경우 AI 호출 스킵
    if (useMockAI || !process.env.OPENAI_API_KEY) {
      const randomRestaurant = finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
      return NextResponse.json({
        restaurant: randomRestaurant,
        aiComment: "지금 상황에 딱 맞는 선택입니다. (AI 연결 전 Mock 응답)",
      })
    }

    // GPT-4o mini 호출 (실제)
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
            content: `너는 여의도 직장인들을 위한 맛집 추천 AI야. 눈치 빠르고 센스 있게, 직장 생활의 고충을 이해하는 톤으로 추천해줘. 
            
주어진 상황과 식당 정보를 보고:
1. 가장 적합한 식당 1곳을 선택
2. 추천 이유를 직장인 공감형 유머로 한 줄로 작성 (존댓말 사용)

반드시 JSON 형식으로만 응답: { "restaurantId": 숫자, "comment": "추천 코멘트" }`,
          },
          {
            role: "user",
            content: `상황:
- 동행인: ${getCompanionLabel(selection.companion)}
- 거리/상황: ${getSituationLabel(selection.situation)}
- 기분/메뉴: ${getMoodLabel(selection.mood)}

후보 식당들:
${JSON.stringify(finalCandidates, null, 2)}

이 중 딱 1곳을 선택하고, 센스있는 추천 코멘트를 작성해줘.`,
          },
        ],
        temperature: 0.8,
      }),
    })

    const aiData = await aiResponse.json()

    // AI 응답 파싱 실패 대비
    let aiChoice
    try {
      aiChoice = JSON.parse(aiData.choices[0].message.content)
    } catch (e) {
      console.error("AI Parse Error:", e)
      // 파싱 실패시 랜덤 폴백
      const randomRestaurant = finalCandidates[0]
      return NextResponse.json({
        restaurant: randomRestaurant,
        aiComment: "AI가 과부하로 잠시 쉬고 있네요. 그래도 여기 추천합니다!",
      })
    }

    const selectedRestaurant = finalCandidates.find((r: any) => r.id === aiChoice.restaurantId) || finalCandidates[0]

    return NextResponse.json({
      restaurant: selectedRestaurant,
      aiComment: aiChoice.comment,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "추천 중 오류가 발생했습니다" }, { status: 500 })
  }
}

function getCompanionLabel(value?: string) {
  const map: Record<string, string> = {
    solo: "혼밥",
    colleague: "편한 동기",
    manager: "어색한 팀장님",
    executive: "격식 있는 임원",
    date: "잘 보여야 하는 썸",
  }
  return map[value || ""] || "알 수 없음"
}

function getSituationLabel(value?: string) {
  const map: Record<string, string> = {
    indoor: "비 오는 날 (건물 내만)",
    quick: "5분 컷 (빠르게)",
    walk: "10분 산책 가능",
    taxi: "택시 타고 멀리 갈 수 있음",
  }
  return map[value || ""] || "알 수 없음"
}

function getMoodLabel(value?: string) {
  const map: Record<string, string> = {
    hangover: "해장 필요",
    expensive: "법카 찬스 (비싼 곳)",
    diet: "다이어트 중",
    delicious: "그냥 맛있는 거",
  }
  return map[value || ""] || "알 수 없음"
}
