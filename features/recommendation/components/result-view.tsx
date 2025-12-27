import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Utensils, CreditCard, RefreshCw, Clock } from "lucide-react"
import { LiveChat } from "@/components/live-chat"
import { RecommendationResult, UserSelection } from "@/features/recommendation/types"

interface ResultViewProps {
    result: RecommendationResult
    selection: UserSelection
    onReset: () => void
    onRetry: () => void
}

function getDynamicTitle(selection: UserSelection) {
    const { companion, mood, situation } = selection

    if (companion === "manager") return "팀장님 100% 만족 코스! 👔"
    if (companion === "executive") return "임원 의전용 프리미엄 픽 💼"
    if (companion === "date") return "썸 성공률 200% 분위기 맛집 💘"
    if (companion === "solo") return "혼밥러들의 숨은 성지 🛡️"

    if (mood === "hangover") return "쓰린 속을 달래줄 구세주 🚑"
    if (mood === "diet") return "맛있어도 0칼로리... 맞죠? 🥗"
    if (mood === "expensive") return "법카 찬스! 맘껏 드세요 💳"

    if (situation === "indoor") return "비 한 방울 안 맞고 도착! ☔"

    return "이 상황에 딱 맞는 곳을 찾았어요 ✨"
}

function getCategoryEmoji(category: string) {
    if (category.includes("한식")) return "🍚"
    if (category.includes("일식")) return "🍣"
    if (category.includes("중식")) return "🥟"
    if (category.includes("양식")) return "🍝"
    if (category.includes("분식")) return "🍜"
    if (category.includes("카페")) return "☕"
    return "🍽️"
}

export function ResultView({ result, selection, onReset, onRetry }: ResultViewProps) {
    const openMap = (restaurantName: string) => {
        window.open(`https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(restaurantName)}`, "_blank")
    }

    // 에러 발생 시 처리
    if (result.error || !result.restaurant) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F9FAFB] p-4 text-center">
                <div className="text-6xl">😭</div>
                <h1 className="text-2xl font-bold text-gray-900">{result.error || "추천할 식당을 찾지 못했어요."}</h1>
                <p className="text-gray-600">조건을 조금만 넓혀서 다시 시도해 볼까요?</p>
                <Button onClick={onReset} className="mt-4 bg-[#3182F6]">
                    처음으로 돌아가기
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-4 pb-24">
            <div className="mx-auto max-w-2xl pt-8">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900 text-balance">{getDynamicTitle(selection)}</h1>
                    <p className="text-gray-600 font-medium break-keep">"{result.aiComment}"</p>
                </div>

                <div className="relative z-10">
                    <Card className="mb-0 overflow-hidden rounded-t-2xl rounded-b-none border-0 shadow-xl relative">
                        <div className="bg-gradient-to-br from-[#3182F6] to-[#1e5dd8] p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="text-5xl drop-shadow-lg animate-bounce-slow">
                                    {getCategoryEmoji(result.restaurant!.category)}
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-white">{result.restaurant!.name}</h2>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mb-2">
                                {result.restaurant!.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white">
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4">
                                    <Utensils className="h-5 w-5 text-gray-400 mb-1.5" />
                                    <span className="text-xs text-gray-500 mb-0.5">카테고리</span>
                                    <span className="font-semibold text-gray-900">{result.restaurant!.category}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4">
                                    <MapPin className="h-5 w-5 text-gray-400 mb-1.5" />
                                    <span className="text-xs text-gray-500 mb-0.5">거리</span>
                                    <span className="font-semibold text-gray-900">
                                        {result.restaurant!.location_type === "indoor" ? "건물 내" :
                                            result.restaurant!.location_type === "near" ? "5분 컷" :
                                                result.restaurant!.location_type === "walk" ? "10분 산책" : "택시 이동"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4">
                                    <CreditCard className="h-5 w-5 text-gray-400 mb-1.5" />
                                    <span className="text-xs text-gray-500 mb-0.5">가격대</span>
                                    <span className="font-semibold text-gray-900">
                                        {result.restaurant!.price_range === "low" ? "저렴함" :
                                            result.restaurant!.price_range === "mid" ? "적당함" : "법카용"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
                                    <Clock className="h-5 w-5 text-blue-400 mb-1.5" />
                                    <span className="text-xs text-blue-500 mb-0.5">웨이팅/예약</span>
                                    <span className="font-semibold text-gray-900">
                                        {result.restaurant!.waiting_info || "현장 대기"}
                                    </span>
                                </div>
                            </div>

                            {result.aiReasons && result.aiReasons.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">추천 이유</h3>
                                    <div className="space-y-1.5">
                                        {result.aiReasons.map((reason, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={() => openMap(result.restaurant!.name)}
                                className="w-full h-12 bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB] font-semibold text-base gap-2"
                                variant="ghost"
                            >
                                <MapPin className="h-4 w-4" />
                                네이버 지도로 위치 보기
                            </Button>
                        </div>
                    </Card>

                    <LiveChat />
                </div>

                <div className="mt-8 space-y-3 px-2">
                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={onReset} variant="outline" className="h-14 font-medium text-gray-600 border-gray-300">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            처음부터 다시
                        </Button>
                        <Button onClick={onRetry} className="h-14 bg-[#3182F6] hover:bg-[#1e5dd8] font-bold text-base shadow-lg shadow-blue-500/20">
                            다른 식당은?
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
