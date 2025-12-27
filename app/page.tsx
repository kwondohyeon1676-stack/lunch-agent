"use client"

import { useEffect } from "react"
import { ReportModal } from "@/components/report-modal"
import { DonationButton } from "@/components/donation-button"
import { useRecommendationFunnel } from "@/features/recommendation/hooks/use-recommendation-funnel"
import { QuestionCard } from "@/features/recommendation/components/question-card"
import { LoadingView } from "@/features/recommendation/components/loading-view"
import { ResultView } from "@/features/recommendation/components/result-view"
import { ProgressIndicator } from "@/features/recommendation/components/progress-indicator"
import {
  BUILDING_OPTIONS,
  COMPANION_OPTIONS,
  SITUATION_OPTIONS,
  MOOD_OPTIONS
} from "@/features/recommendation/constants"

export default function Home() {
  const { step, selection, result, updateSelection, reset } = useRecommendationFunnel()

  // Scroll to top when result appears
  useEffect(() => {
    if (step === "result") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [step])

  if (step === "loading") {
    return <LoadingView selection={selection} />
  }

  if (step === "result" && result) {
    return (
      <ResultView
        result={result}
        selection={selection}
        onReset={reset}
        onRetry={() => updateSelection("mood", selection.mood!)}
      />
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
        <ProgressIndicator currentStep={step} />

        {/* Questions */}
        {step === "building" && (
          <QuestionCard
            question="어느 건물에서 출발하시나요?"
            options={BUILDING_OPTIONS}
            onSelect={(value) => updateSelection("building", value)}
            selected={selection.building}
          />
        )}

        {step === "companion" && (
          <QuestionCard
            question="누구랑 식사하시나요?"
            options={COMPANION_OPTIONS}
            onSelect={(value) => updateSelection("companion", value)}
            selected={selection.companion}
          />
        )}

        {step === "situation" && (
          <QuestionCard
            question="오늘의 상황은?"
            options={SITUATION_OPTIONS}
            onSelect={(value) => updateSelection("situation", value)}
            selected={selection.situation}
          />
        )}

        {step === "mood" && (
          <QuestionCard
            question="오늘 점심은 어떤 스타일을 원하시나요?"
            options={MOOD_OPTIONS}
            onSelect={(value) => updateSelection("mood", value)}
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

