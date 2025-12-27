"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, MapPin, Utensils, CreditCard, RefreshCw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportModal } from "@/components/report-modal"
import { DonationButton } from "@/components/donation-button"
import { LiveChat } from "@/components/live-chat"

type Step = "building" | "companion" | "situation" | "mood" | "loading" | "result"

type Selection = {
  building?: string
  companion?: string
  situation?: string
  mood?: string
}

type Restaurant = {
  id: number
  name: string
  location_type: string
  category: string
  price_range: string
  tags: string[]
  description: string
  waiting_info?: string
}

type RecommendationResult = {
  restaurant?: Restaurant
  aiComment?: string
  error?: string
}

const MIN_LOADING_TIME_MS = 2000
const LOADING_MESSAGE_INTERVAL_MS = 800

function getLoadingMessages(selection: Selection) {
  const messages = [
    "최단 경로 계산 중...",
    "오늘의 날씨 고려 중...",
    "데이터베이스 조회 중...",
  ]

  // 동행인별 메시지
  if (selection.companion === "manager") {
    messages.unshift("팀장님 심기 파악 중...", "웨이팅 없는 곳 우선 검색...", "빠른 서빙 가능 여부 확인...")
  } else if (selection.companion === "executive") {
    messages.unshift("법인카드 한도 조회 중...", "조용한 룸 스캔 중...", "의전 프로토콜 가동...")
  } else if (selection.companion === "date") {
    messages.unshift("분위기 점수 계산 중...", "센스 있는 메뉴 선정 중...", "조명 밝기 시뮬레이션...")
  } else if (selection.companion === "colleague") {
    messages.unshift("법카 말고 내돈내산 가성비 계산...", "신상 맛집 탐색 중...")
  }

  // 상황/기분별 메시지
  if (selection.mood === "hangover") {
    messages.push("콩나물 수급 확인 중...", "생존을 위한 국물패턴 분석...", "사장님 속풀이 긴급 지원...")
  } else if (selection.mood === "expensive") {
    messages.push("가장 비싼 메뉴 정렬 중...", "랍스타/참치 재고 확인...", "영수증 길이 예측 중...")
  } else if (selection.mood === "diet") {
    messages.push("칼로리 계산기 가동...", "풀때기 신선도 체크...", "마요네즈 제외 옵션 확인...")
  }

  if (selection.situation === "indoor") {
    messages.push("비 안 맞는 지하 통로 탐색...", "우산 없이 가는 길 계산...")
  }

  return messages
}

function getDynamicTitle(selection: Selection) {
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

export default function Home() {
  const [step, setStep] = useState<Step>("building")
  const [selection, setSelection] = useState<Selection>({})
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0)

  // 동적 로딩 메시지 계산
  const currentMessages = getLoadingMessages(selection)

  const handleSelection = async (key: keyof Selection, value: string) => {
    const newSelection = { ...selection, [key]: value }
    setSelection(newSelection)

    // 다음 단계로 진행
    if (step === "building") {
      setStep("companion")
    } else if (step === "companion") {
      setStep("situation")
    } else if (step === "situation") {
      setStep("mood")
    } else if (step === "mood") {
      // 로딩 시작
      setStep("loading")
      setCurrentLoadingMessage(0)

      // 로딩 메시지 변경
      // 렌더링 시점에 계산된 currentMessages를 사용하지만, 
      // setInterval 내부 클로저에서는 최신 selection을 반영한 messages가 필요하므로
      // 여기서는 interval 내에서 인덱스만 관리하고 렌더링에서 참조함
      const messageInterval = setInterval(() => {
        setCurrentLoadingMessage((prev) => (prev + 1) % getLoadingMessages(newSelection).length)
      }, LOADING_MESSAGE_INTERVAL_MS)

      try {
        // AI 추천 요청
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSelection),
        })

        const data = await response.json()

        // 최소 2초 로딩 보장 (UX)
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS))

        clearInterval(messageInterval)
        setResult(data)
        setStep("result")
      } catch (error) {
        console.error("[v0] Recommendation error:", error)
        clearInterval(messageInterval)
      }
    }
  }

  const resetFlow = () => {
    setStep("building")
    setSelection({})
    setResult(null)
    setCurrentLoadingMessage(0)
  }

  const openMap = (restaurantName: string) => {
    window.open(`https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(restaurantName)}`, "_blank")
  }

  // Scroll to top when result appears
  useEffect(() => {
    if (step === "result") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [step])

  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#E8F3FF] border-t-[#3182F6]" />
          <p className="text-lg font-medium text-gray-700">{currentMessages[currentLoadingMessage]}</p>
        </div>
      </div>
    )
  }

  if (step === "result" && result) {
    // 에러 발생 시 처리
    if (result.error || !result.restaurant) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F9FAFB] p-4 text-center">
          <div className="text-6xl">😭</div>
          <h1 className="text-2xl font-bold text-gray-900">{result.error || "추천할 식당을 찾지 못했어요."}</h1>
          <p className="text-gray-600">조건을 조금만 넓혀서 다시 시도해 볼까요?</p>
          <Button onClick={resetFlow} className="mt-4 bg-[#3182F6]">
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
            <p className="text-gray-600">AI가 엄선한 최적의 장소입니다</p>
          </div>

          <div className="relative z-10">
            <Card className="mb-0 overflow-hidden rounded-t-2xl rounded-b-none border-0 shadow-xl relative">
              <div className="bg-gradient-to-br from-[#3182F6] to-[#1e5dd8] p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

                <div className="text-6xl mb-4 drop-shadow-lg animate-bounce-slow">
                  {getCategoryEmoji(result.restaurant!.category)}
                </div>

                <h2 className="mb-3 text-3xl font-bold tracking-tight">{result.restaurant!.name}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {result.restaurant!.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="mb-6 relative">
                  <div className="absolute -top-3 left-4 text-4xl text-[#E8F3FF]">❝</div>
                  <div className="rounded-xl bg-[#F0F7FF] p-5 relative z-10">
                    <p className="font-medium text-gray-800 text-lg leading-relaxed text-center">"{result.aiComment}"</p>
                  </div>
                  <div className="absolute -bottom-3 right-4 text-4xl text-[#E8F3FF] rotate-180">❝</div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3">
                    <Utensils className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">카테고리</span>
                    <span className="font-semibold text-gray-900">{result.restaurant!.category}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3">
                    <MapPin className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">거리</span>
                    <span className="font-semibold text-gray-900">
                      {result.restaurant!.location_type === "indoor" ? "건물 내" :
                        result.restaurant!.location_type === "near" ? "5분 컷" :
                          result.restaurant!.location_type === "walk" ? "10분 산책" : "택시 이동"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">가격대</span>
                    <span className="font-semibold text-gray-900">
                      {result.restaurant!.price_range === "low" ? "저렴함" :
                        result.restaurant!.price_range === "mid" ? "적당함" : "법카용"}
                    </span>
                  </div>
                </div>

                {result.restaurant!.waiting_info && (
                  <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 py-3 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{result.restaurant!.waiting_info}</span>
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
              <Button onClick={resetFlow} variant="outline" className="h-14 font-medium text-gray-600 border-gray-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                처음부터 다시
              </Button>
              <Button onClick={() => handleSelection("mood", selection.mood!)} className="h-14 bg-[#3182F6] hover:bg-[#1e5dd8] font-bold text-base shadow-lg shadow-blue-500/20">
                다른 식당은?
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 pb-24">
      <div className="mx-auto max-w-2xl pt-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">여의도 미식회</h1>
          <p className="text-lg text-gray-600">TP타워 생존 가이드</p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex justify-center gap-2">
          {["building", "companion", "situation", "mood"].map((s, idx) => (
            <div
              key={s}
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                ["building", "companion", "situation", "mood"].indexOf(step) >= idx ? "bg-[#3182F6]" : "bg-gray-200",
              )}
            />
          ))}
        </div>

        {/* Questions */}
        {step === "building" && (
          <QuestionCard
            question="어느 건물에서 출발하시나요?"
            options={[
              { label: "TP타워", value: "tp-tower", available: true },
              { label: "IFC몰", value: "ifc", available: false },
              { label: "파크원", value: "park-one", available: false },
            ]}
            onSelect={(value) => handleSelection("building", value)}
            selected={selection.building}
          />
        )}

        {step === "companion" && (
          <QuestionCard
            question="누구랑 식사하시나요?"
            options={[
              { label: "혼밥", value: "solo", icon: "🙋" },
              { label: "동기 (편함)", value: "colleague", icon: "👥" },
              { label: "팀장님 (어색)", value: "manager", icon: "👔" },
              { label: "임원 (격식)", value: "executive", icon: "💼" },
              { label: "썸 (잘보여야 함)", value: "date", icon: "💝" },
            ]}
            onSelect={(value) => handleSelection("companion", value)}
            selected={selection.companion}
          />
        )}

        {step === "situation" && (
          <QuestionCard
            question="오늘의 상황은?"
            options={[
              { label: "비와요 (건물 내)", value: "indoor", icon: "🌧️" },
              { label: "5분 컷 (귀찮아)", value: "quick", icon: "⚡" },
              { label: "10분 산책 가능", value: "walk", icon: "🚶" },
              { label: "택시 타고 멀리", value: "taxi", icon: "🚕" },
            ]}
            onSelect={(value) => handleSelection("situation", value)}
            selected={selection.situation}
          />
        )}

        {step === "mood" && (
          <QuestionCard
            question="오늘 점심은 어떤 스타일을 원하시나요?"
            options={[
              { label: "살려줘 (해장)", value: "hangover", icon: "🤢" },
              { label: "법카 찬스 (비싼거)", value: "expensive", icon: "💳" },
              { label: "다이어트", value: "diet", icon: "🥗" },
              { label: "그냥 맛있는 거", value: "delicious", icon: "😋" },
            ]}
            onSelect={(value) => handleSelection("mood", value)}
            selected={selection.mood}
          />
        )}

        {/* Footer Area */}
        <div className="mt-12 space-y-4 border-t border-gray-100 pt-8">
          <ReportModal />
          <DonationButton />
          <p className="text-center text-xs text-gray-400">
            여의도 미식회는 K증권 권또가 운영합니다. <br />
            © 2025 Kwondo
          </p>
        </div>
      </div>
    </div>
  )
}

function QuestionCard({
  question,
  options,
  onSelect,
  selected,
}: {
  question: string
  options: Array<{ label: string; value: string; available?: boolean; icon?: string }>
  onSelect: (value: string) => void
  selected?: string
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-balance">{question}</h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => option.available !== false && onSelect(option.value)}
            disabled={option.available === false}
            className={cn(
              "relative w-full rounded-xl p-5 text-left transition-all",
              "border-2 font-semibold text-lg",
              option.available === false
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : selected === option.value
                  ? "border-[#3182F6] bg-[#E8F3FF] text-[#3182F6] scale-[0.98]"
                  : "border-gray-200 bg-white text-gray-900 hover:border-[#3182F6] hover:scale-[0.99] active:scale-[0.98]",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {option.icon && <span className="text-2xl">{option.icon}</span>}
                <span>{option.label}</span>
              </div>
              {option.available === false && <span className="text-sm font-normal">준비 중</span>}
              {selected === option.value && <Check className="h-6 w-6" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
