"use client";
import { useState, useEffect } from "react";
import { Review } from "@/app/types";

export interface FeedbackData {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    positivePercent: number;
    distribution: { star: number; count: number; total: number }[];
    loading: boolean;
    error: string | null;
}

export function useFeedback(): FeedbackData {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [backendStats, setBackendStats] = useState<{
        averageRating: number;
        totalReviews: number;
        positivePercent: number;
        distribution: { star: number; count: number; total: number }[];
    } | null>(null);

    useEffect(() => {
        async function fetchReviews() {
            try {
                setLoading(true);
                setError(null);

                const tokenRes = await fetch("/api/auth/session/token", {
                    credentials: "include",
                });
                const { token } = await tokenRes.json();
                if (!token) throw new Error("No authorization token found.");

                const res = await fetch("/api/v1/reviews/me", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error(`Failed to fetch reviews (${res.status})`);

                const json = await res.json();
                if (!json.success) throw new Error("API returned success: false");

                const payload = json.data;

                const rawReviews = payload.recentReviews ?? [];
                console.log("First review item:", rawReviews[0]);

                const mapped: Review[] = rawReviews.map((item: {
                    id: string;
                    rating: number;
                    comment: string;
                    name?: string;
                    avatar?: string;
                    timeAgo?: string;
                    createdAt?: string;
                }) => ({
                    id: item.id,
                    rating: item.rating,
                    comment: item.comment,
                    name: item.name ?? "Anonymous",
                    avatar: item.avatar ?? `https://i.pravatar.cc/150?u=${item.id}`,
                    timeAgo: item.timeAgo ?? (item.createdAt ? formatTimeAgo(item.createdAt) : ""),
                }));

                setReviews(mapped);

                setBackendStats({
                    averageRating: payload.overallRating ?? 0,
                    totalReviews: payload.totalReviews ?? 0,
                    positivePercent: payload.positivePercentage ?? 0,
                    distribution: [5, 4, 3, 2, 1].map((star) => ({
                        star,
                        count: payload.starBreakdown?.[star] ?? 0,
                        total: payload.totalReviews ?? 0,
                    })),
                });

            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchReviews();
    }, []);

    const stats = backendStats ?? {
        averageRating: 0,
        totalReviews: 0,
        positivePercent: 0,
        distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, total: 0 })),
    };

    return { reviews, loading, error, ...stats };
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}