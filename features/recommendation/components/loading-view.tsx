import { useEffect, useState } from "react"
import { UserSelection } from "@/features/recommendation/types"
import { LOADING_MESSAGES, LOADING_MESSAGE_INTERVAL_MS } from "@/features/recommendation/constants"

function getLoadingMessages(selection: UserSelection) {
    const messages = [...LOADING_MESSAGES.common]

    if (selection.companion && selection.companion in LOADING_MESSAGES.companion) {
        const key = selection.companion as keyof typeof LOADING_MESSAGES.companion
        messages.unshift(...LOADING_MESSAGES.companion[key])
    }

    if (selection.mood && selection.mood in LOADING_MESSAGES.mood) {
        const key = selection.mood as keyof typeof LOADING_MESSAGES.mood
        messages.push(...LOADING_MESSAGES.mood[key])
    }

    if (selection.situation === "indoor") {
        messages.push(...LOADING_MESSAGES.situation.indoor)
    }

    return messages
}

interface LoadingViewProps {
    selection: UserSelection
}

export function LoadingView({ selection }: LoadingViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const messages = getLoadingMessages(selection)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length)
        }, LOADING_MESSAGE_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [messages.length])

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
            <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#E8F3FF] border-t-[#3182F6]" />
                <p className="text-lg font-medium text-gray-700">{messages[currentIndex]}</p>
            </div>
        </div>
    )
}
