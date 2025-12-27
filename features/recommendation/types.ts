export type Step = "building" | "companion" | "situation" | "mood" | "loading" | "result"

export type UserSelection = {
    building?: string
    companion?: string
    situation?: string
    mood?: string
}

export type Restaurant = {
    id: string | number
    name: string
    location_type: string
    category: string
    price_range: string
    tags: string[]
    description: string
    waiting_info?: string
    reasons?: string[] // AI가 선택한 구체적 이유
}

export type RecommendationResult = {
    restaurant?: Restaurant
    aiComment?: string
    aiReasons?: string[] // 새롭게 추가된 필드
    error?: string
}
