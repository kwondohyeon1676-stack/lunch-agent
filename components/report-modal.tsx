"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"
import { submitReport } from "@/actions/report"

export function ReportModal() {
    const [open, setOpen] = useState(false)
    const [location, setLocation] = useState("")
    const [name, setName] = useState("")
    const [review, setReview] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        // 상세 유효성 검사 및 안내
        if (!location.trim()) {
            toast.error("식당 위치를 입력해 주세요.")
            return
        }
        if (!name.trim()) {
            toast.error("식당 이름을 입력해 주세요.")
            return
        }
        if (!review.trim()) {
            toast.error("맛집에 대한 한줄평을 입력해 주세요.")
            return
        }

        // 너무 짧은 입력 방지
        if (location.trim().length < 2 || name.trim().length < 2 || review.trim().length < 5) {
            toast.error("조금 더 자세하게 입력해 주시면 AI가 더 잘 분석할 수 있어요! (한줄평은 5자 이상)")
            return
        }

        setIsSubmitting(true)
        try {
            const combinedText = `위치: ${location}\n식당명: ${name}\n한줄평: ${review}`

            // Server Action 호출
            const result = await submitReport({ text: combinedText })

            if (result.error) {
                throw new Error(result.error)
            }

            toast.success(result.message || "제보해 주셔서 감사합니다! (승인 대기 중)")
            setOpen(false)
            setLocation("")
            setName("")
            setReview("")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "오류가 발생했습니다.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-dashed">
                    <Send className="h-4 w-4" />
                    나만의 맛집 제보하기
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">숨겨진 맛집을 알려주세요!</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        AI가 정보를 분석하여 미식회 데이터베이스에 등록합니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">위치</label>
                        <input
                            title="위치"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: TP타워 지하 1층, 파크원 등"
                            className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">식당명</label>
                        <input
                            title="식당명"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 오복수산"
                            className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-semibold text-gray-700">한줄평</label>
                        <Textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="예: 카이센동이 맛있는데 점심엔 웨이팅 좀 있음. (AI 분석용)"
                            className="min-h-[100px] rounded-xl border-gray-200 bg-gray-50 p-4 text-base resize-none focus-visible:ring-[#3182F6]"
                        />
                    </div>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-14 w-full bg-[#3182F6] text-lg font-bold hover:bg-[#1e5dd8] rounded-xl disabled:bg-gray-300"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            AI가 분석 중...
                        </>
                    ) : (
                        "제보하기"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
