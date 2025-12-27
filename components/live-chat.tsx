"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


type Message = {
    id: number
    name: string
    content: string
    isMe: boolean
}

const MOCK_MESSAGES = [
    "지금 웨이팅 10팀 실화냐...",
    "여기 김치찌개 오늘 좀 짠데?",
    "부장님 기분 안좋아보임 조심",
    "TP타워 1층 스타벅스 자리 없음",
    "오늘 메뉴 뭐 나옴?",
    "여기 법카 쓰기 딱 좋네 ㅋㅋ",
    "재료 소진됐대요 헛걸음 ㄴㄴ",
]

const RANDOM_NAMES = ["법카쓰는 과장님", "퇴사 꿈나무", "여의도 불개미", "연차쓰고 싶은 대리", "점심에 진심인 대리", "탕수육 부먹 사원", "커피 수혈 중인 사원", "회의지옥 탈출자"]

export function LiveChat() {
    const [nickname, setNickname] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, name: "시스템", content: "실시간 생존 신고 채팅방에 입장하셨습니다.", isMe: false },
        { id: 2, name: "익명의 김대리", content: "오늘 웨이팅 박터지네요 ㄷㄷ", isMe: false },
    ])
    const [inputValue, setInputValue] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Handle Nickname
    useEffect(() => {
        const savedNickname = localStorage.getItem("yeouido-nickname")
        if (savedNickname) {
            setNickname(savedNickname)
        } else {
            const newNickname = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
            localStorage.setItem("yeouido-nickname", newNickname)
            setNickname(newNickname)
        }
    }, [])

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Simulate incoming messages
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) return // 30% chance to skip

            const randomMsg = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
            const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]

            setMessages((prev) => [
                ...prev,
                { id: Date.now(), name: randomName, content: randomMsg, isMe: false },
            ])
        }, 3500)

        return () => clearInterval(interval)
    }, [])

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        setMessages((prev) => [
            ...prev,
            { id: Date.now(), name: nickname, content: inputValue, isMe: true },
        ])
        setInputValue("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSendMessage()
    }

    return (
        <div className="w-full overflow-hidden rounded-b-3xl border-x border-b border-gray-200 bg-[#F5F5F7] shadow-lg relative z-0">
            {/* Connection Line */}
            <div className="w-full border-t-2 border-dashed border-gray-300 opacity-50"></div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F7]">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="font-bold text-sm text-gray-700">LIVE 공유</span>
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full border border-blue-100 italic">
                        #당신은_오늘_{nickname}
                    </span>
                </div>
                <span className="text-xs font-medium text-gray-500">248명 접속 중</span>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="h-[200px] overflow-y-auto bg-[#F5F5F7] p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
                <div className="flex flex-col gap-2">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex max-w-[90%] flex-col ${msg.isMe ? "self-end items-end" : "self-start items-start"}`}
                        >
                            {!msg.isMe && <span className="mb-0.5 text-[10px] text-gray-400">{msg.name}</span>}
                            <div
                                className={`rounded-lg px-3 py-1.5 text-sm shadow-sm ${msg.isMe ? "bg-[#3182F6] text-white" : "bg-white text-gray-700"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-white p-3">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="상황을 공유주세요 (예: 웨이팅 쩔어..)"
                        className="flex-1 border-gray-200 bg-gray-50 focus-visible:ring-[#3182F6]"
                    />
                    <Button onClick={handleSendMessage} size="icon" className="bg-[#3182F6] hover:bg-[#1e5dd8]">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
