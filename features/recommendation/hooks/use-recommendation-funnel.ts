import { useState } from "react"
import { Step, UserSelection, RecommendationResult } from "../types"
import { MIN_LOADING_TIME_MS } from "../constants"
import { getRecommendation } from "@/actions/recommend"

export function useRecommendationFunnel() {
    const [step, setStep] = useState<Step>("building")
    const [selection, setSelection] = useState<UserSelection>({})
    const [result, setResult] = useState<RecommendationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const updateSelection = async (key: keyof UserSelection, value: string) => {
        const newSelection = { ...selection, [key]: value }
        setSelection(newSelection)

        // Flow Logic
        if (step === "building") {
            setStep("companion")
        } else if (step === "companion") {
            setStep("situation")
        } else if (step === "situation") {
            setStep("mood")
        } else if (step === "mood") {
            // Start Loading & Fetch
            await submitRecommendation(newSelection)
        }
    }

    const submitRecommendation = async (finalSelection: UserSelection) => {
        setStep("loading")
        setIsLoading(true)

        try {
            // 1. Minimum Loading Delay Promise
            const delayPromise = new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME_MS))

            // 2. Server Action
            const actionPromise = getRecommendation(finalSelection)

            // Wait for both
            const [_, data] = await Promise.all([delayPromise, actionPromise])

            setResult(data)
            setStep("result")
        } catch (error) {
            console.error("Recommendation error:", error)
            setResult({ error: "추천 중 오류가 발생했습니다." })
            setStep("result")
        } finally {
            setIsLoading(false)
        }
    }

    const reset = () => {
        setStep("building")
        setSelection({})
        setResult(null)
        setIsLoading(false)
    }

    return {
        step,
        selection,
        result,
        updateSelection,
        reset,
        isLoading
    }
}
