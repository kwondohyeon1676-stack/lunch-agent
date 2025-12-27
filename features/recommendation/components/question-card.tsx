import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
    label: string
    value: string
    available?: boolean
    icon?: string
}

interface QuestionCardProps {
    question: string
    options: Option[]
    onSelect: (value: string) => void
    selected?: string
}

export function QuestionCard({ question, options, onSelect, selected }: QuestionCardProps) {
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
