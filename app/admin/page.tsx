"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Check, X, Pencil, Trash2, Lock, Copy, Sparkles } from "lucide-react"
import {
    getRestaurants,
    updateRestaurant,
    approveRestaurant,
    rejectRestaurant,
    deleteRestaurant,
    type Restaurant,
} from "@/actions/admin"
import { enrichRestaurant } from "@/actions/enrich"

// 관리자 비밀번호 (환경변수 또는 기본값)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin1234"

// 외부 AI용 복사 포맷 생성
function formatForExternalAI(r: Restaurant): string {
    return `[식당 정보 보강 요청]
식당명: ${r.name}
원본 제보: ${r.raw_input || "없음"}

현재 입력된 정보:
- 카테고리: ${r.category || "미입력"}
- 거리: ${r.location_type || "미입력"}
- 가격대: ${r.price_range || "미입력"}
- 태그: ${r.tags?.join(", ") || "미입력"}
- 웨이팅 정보: ${r.waiting_info || "미입력"}
- 설명: ${r.description || "미입력"}

위 식당에 대해 누락된 정보를 채워주세요. 특히:
1. 카테고리 (한식/일식/중식/양식/카페/기타)
2. 거리 (indoor:건물내 / near:5분 / walk:10분 / taxi:택시)
3. 가격대 (low:저렴 / mid:보통 / high:법카용)
4. 태그 (예: 해장, 가성비, 웨이팅, 혼밥, 데이트)
5. 웨이팅/예약 정보
6. 한 줄 설명 (유머러스하게)`
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const loadRestaurants = async () => {
        setIsLoading(true)
        const status = statusFilter === "all" ? undefined : statusFilter
        const data = await getRestaurants(status)
        setRestaurants(data)
        setIsLoading(false)
    }

    useEffect(() => {
        if (isAuthenticated) {
            loadRestaurants()
        }
    }, [isAuthenticated, statusFilter])

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            toast.success("관리자 로그인 성공!")
        } else {
            toast.error("비밀번호가 틀렸습니다.")
        }
    }

    const handleApprove = async (id: string) => {
        const result = await approveRestaurant(id)
        if (result.success) {
            toast.success("승인 완료!")
            loadRestaurants()
        }
    }

    const handleReject = async (id: string) => {
        const result = await rejectRestaurant(id)
        if (result.success) {
            toast.success("거절 처리 완료")
            loadRestaurants()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return
        const result = await deleteRestaurant(id)
        if (result.success) {
            toast.success("삭제 완료")
            loadRestaurants()
        }
    }

    const handleSaveEdit = async () => {
        if (!editingRestaurant) return
        const result = await updateRestaurant(editingRestaurant.id, editingRestaurant)
        if (result.success) {
            toast.success("수정 완료!")
            setEditingRestaurant(null)
            loadRestaurants()
        }
    }

    const handleCopyForAI = (r: Restaurant) => {
        const text = formatForExternalAI(r)
        navigator.clipboard.writeText(text)
        toast.success("클립보드에 복사됨! Genspark에 붙여넣기 하세요.")
    }

    const handleEnrich = async (r: Restaurant) => {
        toast.info("AI 보강 중... 잠시만 기다려주세요.")
        const result = await enrichRestaurant(r.id, r.name)
        if (result.success) {
            toast.success(`${r.name} 정보 보강 완료!`)
            loadRestaurants()
        } else {
            toast.error(result.error || "보강 실패")
        }
    }

    // 로그인 화면
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-12 h-12 text-[#3182F6]" />
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-6">관리자 페이지</h1>
                    <Input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        className="mb-4"
                    />
                    <Button onClick={handleLogin} className="w-full bg-[#3182F6]">
                        로그인
                    </Button>
                </div>
            </div>
        )
    }

    // 관리자 대시보드
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">🍽️ 식당 관리</h1>

                {/* 필터 */}
                <div className="flex gap-4 mb-6">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="상태 필터" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="pending">대기중</SelectItem>
                            <SelectItem value="approved">승인됨</SelectItem>
                            <SelectItem value="rejected">거절됨</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={loadRestaurants} variant="outline">
                        새로고침
                    </Button>
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>카테고리</TableHead>
                                <TableHead>거리</TableHead>
                                <TableHead>가격대</TableHead>
                                <TableHead>태그</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>제보수</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {restaurants.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.name}</TableCell>
                                    <TableCell>{r.category || "-"}</TableCell>
                                    <TableCell>{r.location_type || "-"}</TableCell>
                                    <TableCell>{r.price_range || "-"}</TableCell>
                                    <TableCell>{r.tags?.join(", ") || "-"}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : r.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {r.status === "approved" ? "승인" : r.status === "rejected" ? "거절" : "대기"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(r.report_count || 1) >= 3
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {r.report_count || 1}건
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingRestaurant(r)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            {r.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-purple-600"
                                                        onClick={() => handleEnrich(r)}
                                                        title="AI 자동 보강"
                                                    >
                                                        <Sparkles className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-blue-600"
                                                        onClick={() => handleCopyForAI(r)}
                                                        title="Genspark용 복사"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-green-600"
                                                        onClick={() => handleApprove(r.id)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-600"
                                                        onClick={() => handleReject(r.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-gray-400"
                                                onClick={() => handleDelete(r.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {restaurants.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {isLoading ? "로딩 중..." : "데이터가 없습니다."}
                        </div>
                    )}
                </div>
            </div>

            {/* 수정 모달 */}
            <Dialog open={!!editingRestaurant} onOpenChange={() => setEditingRestaurant(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>식당 정보 수정</DialogTitle>
                    </DialogHeader>
                    {editingRestaurant && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">식당명</label>
                                <Input
                                    value={editingRestaurant.name}
                                    onChange={(e) =>
                                        setEditingRestaurant({ ...editingRestaurant, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">카테고리</label>
                                    <Select
                                        value={editingRestaurant.category || ""}
                                        onValueChange={(v) =>
                                            setEditingRestaurant({ ...editingRestaurant, category: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="한식">한식</SelectItem>
                                            <SelectItem value="일식">일식</SelectItem>
                                            <SelectItem value="중식">중식</SelectItem>
                                            <SelectItem value="양식">양식</SelectItem>
                                            <SelectItem value="카페">카페</SelectItem>
                                            <SelectItem value="기타">기타</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">거리</label>
                                    <Select
                                        value={editingRestaurant.location_type || ""}
                                        onValueChange={(v) =>
                                            setEditingRestaurant({ ...editingRestaurant, location_type: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="indoor">건물 내</SelectItem>
                                            <SelectItem value="near">5분 컷</SelectItem>
                                            <SelectItem value="walk">10분 산책</SelectItem>
                                            <SelectItem value="taxi">택시 필요</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">가격대</label>
                                    <Select
                                        value={editingRestaurant.price_range || ""}
                                        onValueChange={(v) =>
                                            setEditingRestaurant({ ...editingRestaurant, price_range: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">저렴이</SelectItem>
                                            <SelectItem value="mid">보통</SelectItem>
                                            <SelectItem value="high">법카용</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">상태</label>
                                    <Select
                                        value={editingRestaurant.status || "pending"}
                                        onValueChange={(v) =>
                                            setEditingRestaurant({ ...editingRestaurant, status: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">대기중</SelectItem>
                                            <SelectItem value="approved">승인</SelectItem>
                                            <SelectItem value="rejected">거절</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">태그 (쉼표 구분)</label>
                                <Input
                                    value={editingRestaurant.tags?.join(", ") || ""}
                                    onChange={(e) =>
                                        setEditingRestaurant({
                                            ...editingRestaurant,
                                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                        })
                                    }
                                    placeholder="예: 해장, 가성비, 웨이팅"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">웨이팅/예약 정보</label>
                                <Input
                                    value={editingRestaurant.waiting_info || ""}
                                    onChange={(e) =>
                                        setEditingRestaurant({ ...editingRestaurant, waiting_info: e.target.value })
                                    }
                                    placeholder="예: 캐치테이블 원격줄서기"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">설명 (AI 코멘트)</label>
                                <Textarea
                                    value={editingRestaurant.description || ""}
                                    onChange={(e) =>
                                        setEditingRestaurant({ ...editingRestaurant, description: e.target.value })
                                    }
                                    placeholder="추천 시 표시될 한 줄 설명"
                                />
                            </div>
                            {editingRestaurant.raw_input && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs font-medium text-gray-500">원본 제보 내용</label>
                                    <p className="text-sm mt-1">{editingRestaurant.raw_input}</p>
                                </div>
                            )}
                            <Button onClick={handleSaveEdit} className="w-full bg-[#3182F6]">
                                저장하기
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
