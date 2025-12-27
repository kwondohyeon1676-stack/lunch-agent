"use server"

import { UserSelection } from "@/features/recommendation/types"
import { RecommendationService } from "@/lib/services/recommendation.service"
import { OpenAIService } from "@/lib/services/openai.service"

/**
 * 사용자 선택에 따른 최종 맛집 추천을 수행하는 Server Action
 */
export async function getRecommendation(selection: UserSelection) {
    try {
        // 1. 조건에 맞는 후보 식당들 가져오기 (DB or Mock)
        const candidates = await RecommendationService.getCandidates(selection)

        if (candidates.length === 0) {
            return {
                error: "조건에 맞는 식당을 찾을 수 없습니다. 조금 더 넓은 범위를 선택해 보세요!",
            }
        }

        // 2. AI(GPT-4o mini)를 통해 최적의 1곳 선정 및 코멘트 생성
        const result = await OpenAIService.pickBestRestaurant(candidates, selection)

        return result
    } catch (error) {
        console.error("Recommendation Action Error:", error)
        return {
            error: "추천 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        }
    }
}
