import { createClient } from "@/lib/supabase/server"
import { UserSelection, Restaurant } from "@/features/recommendation/types"

export class RecommendationService {
    static async getCandidates(selection: UserSelection): Promise<Restaurant[]> {
        let finalCandidates: any[] = []

        try {
            const supabase = await createClient()

            // 승인된 식당만 조회
            let query = supabase.from("restaurants").select("*").eq("status", "approved")

            // 1. 거리 필터링 (situation)
            if (selection.situation === "indoor") {
                query = query.eq("location_type", "indoor")
            } else if (selection.situation === "quick") {
                query = query.in("location_type", ["indoor", "near"])
            } else if (selection.situation === "walk") {
                query = query.in("location_type", ["indoor", "near", "walk"])
            }
            // taxi면 전체 허용

            // 2. 동행인 기반 필터링 (companion)
            if (selection.companion === "executive") {
                // 임원: 반드시 높은 가격대
                query = query.eq("price_range", "high")
            } else if (selection.companion === "boss") {
                // 팀장님: 저렴한 곳 제외
                query = query.neq("price_range", "low")
            }
            // alone, team, date는 별도 필터 없음 (태그로 AI가 판단)

            // 3. 기분/메뉴 필터링 (mood)
            if (selection.mood === "expensive") {
                query = query.eq("price_range", "high")
            } else if (selection.mood === "cheap") {
                query = query.in("price_range", ["low", "mid"])
            }
            // diet, hangover는 태그로 AI가 판단

            const { data, error } = await query

            if (error) throw error
            if (data && data.length > 0) {
                finalCandidates = data
            }
        } catch (e) {
            console.log("DB Connection failed or no data, switching to Mock Mode", e)
        }

        // Fallback: 필터 결과가 없으면 전체 조회 시도
        if (finalCandidates.length === 0) {
            try {
                const supabase = await createClient()
                const { data } = await supabase
                    .from("restaurants")
                    .select("*")
                    .eq("status", "approved")
                    .limit(10)

                if (data && data.length > 0) {
                    finalCandidates = data
                }
            } catch (e) {
                // 최종 fallback: Mock 데이터
                return this.getMockCandidates()
            }
        }

        // 여전히 없으면 Mock
        if (finalCandidates.length === 0) {
            return this.getMockCandidates()
        }

        return finalCandidates
    }

    private static getMockCandidates(): Restaurant[] {
        return [
            {
                id: 1,
                name: "오복수산",
                location_type: "indoor",
                category: "일식",
                price_range: "mid",
                tags: ["카이센동", "깔끔", "데이트"],
                description: "신선한 해산물이 듬뿍, 점심부터 호강하는 맛",
                waiting_info: "캐치테이블 원격줄서기",
            },
            {
                id: 2,
                name: "진주집",
                location_type: "walk",
                category: "한식",
                price_range: "low",
                tags: ["콩국수", "웨이팅", "여의도명물"],
                description: "여의도 직장인들의 소울푸드, 줄 서도 먹어야 함",
                waiting_info: "현장 대기만 가능 (회전율 빠름)",
            },
            {
                id: 3,
                name: "세상의모든아침",
                location_type: "indoor",
                category: "양식",
                price_range: "high",
                tags: ["뷰맛집", "브런치", "법카"],
                description: "50층 뷰와 함께 즐기는 우아한 브런치",
                waiting_info: "네이버 예약 권장",
            },
        ]
    }
}
