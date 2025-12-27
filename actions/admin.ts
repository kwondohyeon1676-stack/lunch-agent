"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Restaurant = {
    id: string
    name: string
    category: string | null
    location_type: string | null
    price_range: string | null
    tags: string[] | null
    description: string | null
    waiting_info: string | null
    status: string | null
    raw_input: string | null
    created_at: string | null
    report_count: number | null
}

// 모든 식당 조회 (상태별 필터링 가능)
export async function getRestaurants(status?: string): Promise<Restaurant[]> {
    const supabase = await createClient()

    let query = supabase.from("restaurants").select("*").order("created_at", { ascending: false })

    if (status) {
        query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
        console.error("Failed to fetch restaurants:", error)
        return []
    }

    return data || []
}

// 식당 정보 업데이트
export async function updateRestaurant(id: string, updates: Partial<Restaurant>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("restaurants")
        .update(updates)
        .eq("id", id)

    if (error) {
        console.error("Failed to update restaurant:", error)
        return { error: "업데이트 실패" }
    }

    revalidatePath("/admin")
    return { success: true }
}

// 식당 승인
export async function approveRestaurant(id: string) {
    return updateRestaurant(id, { status: "approved" })
}

// 식당 거절
export async function rejectRestaurant(id: string) {
    return updateRestaurant(id, { status: "rejected" })
}

// 식당 삭제
export async function deleteRestaurant(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Failed to delete restaurant:", error)
        return { error: "삭제 실패" }
    }

    revalidatePath("/admin")
    return { success: true }
}
