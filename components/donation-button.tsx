"use client"

import { Button } from "@/components/ui/button"
import { Coffee } from "lucide-react"
// import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
import { toast } from "sonner"

// 환경변수 또는 상수로 관리 권장
// const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""

export function DonationButton() {
    const handleDonation = async () => {
        // 임시 테스트용 (Mock)
        toast.info("후원 기능은 현재 준비 중입니다! (테스트 모드)")

        /* 
        if (!CLIENT_KEY) {
            toast.error("토스 결제 키가 설정되지 않았습니다. (테스트 모드)")
            return
        }

        try {
            const tossPayments = await loadTossPayments(CLIENT_KEY)
            await tossPayments.requestPayment("카드", {
                amount: 500,
                orderId: Math.random().toString(36).slice(2),
                orderName: "개발자 믹스커피 사주기",
                successUrl: window.location.origin + "/payment/success",
                failUrl: window.location.origin + "/payment/fail",
            })
        } catch (error) {
            console.error(error)
            toast.error("결제 모듈 로드 실패")
        }
        */
    }

    return (
        <Button
            onClick={handleDonation}
            className="w-full gap-2 bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB]"
        >
            <Coffee className="h-4 w-4" />
            개발자에게 믹스커피 한 잔 (500원)
        </Button>
    )
}
