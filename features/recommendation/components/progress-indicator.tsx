import { cn } from "@/lib/utils"
import { Step } from "@/features/recommendation/types"

interface ProgressIndicatorProps {
    currentStep: Step
}

const STEPS: Step[] = ["building", "companion", "situation", "mood"]

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
    return (
        <div className="mb-8 flex justify-center gap-2">
            {STEPS.map((s, idx) => (
                <div
                    key={s}
                    className={cn(
                        "h-2 w-16 rounded-full transition-colors",
                        STEPS.indexOf(currentStep) >= idx ? "bg-[#3182F6]" : "bg-gray-200",
                    )}
                />
            ))}
        </div>
    )
}
