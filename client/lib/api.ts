"use client"

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Token keys
const ACCESS_TOKEN_KEY = "pulse_access_token"
const REFRESH_TOKEN_KEY = "pulse_refresh_token"

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
})

// Token management
export const getAccessToken = (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_KEY)
}

export const setTokens = (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 }) // 1 day
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 }) // 7 days
}

export const clearTokens = () => {
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
}

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = getRefreshToken()
                if (!refreshToken) {
                    clearTokens()
                    window.location.href = "/login"
                    return Promise.reject(error)
                }

                // Try to refresh
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                })

                const { access_token, refresh_token } = response.data
                setTokens(access_token, refresh_token)

                // Retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                }
                return api(originalRequest)
            } catch (refreshError) {
                clearTokens()
                window.location.href = "/login"
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// API Types
export interface User {
    id: string
    email: string
    name: string
    role: "admin" | "creator" | "subscriber"
    created_at: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}

export interface AuthResponse {
    user: User
    access_token: string
    refresh_token: string
}

export interface Campaign {
    id: string
    name: string
    subject: string
    content: string
    status: "draft" | "scheduled" | "sent"
    scheduled_at?: string
    sent_at?: string
    recipients: number
    open_rate?: number
    click_rate?: number
    created_at: string
}

export interface Subscriber {
    id: string
    email: string
    name?: string
    status: "active" | "unsubscribed" | "bounced"
    tags: string[]
    subscribed_at: string
}

export interface AnalyticsOverview {
    total_subscribers: number
    subscriber_growth: number
    total_emails_sent: number
    avg_open_rate: number
    avg_click_rate: number
    total_revenue: number
}

export interface ReferralStats {
    total_referrals: number
    total_conversions: number
    total_revenue: number
    referral_code: string
    leaderboard_rank: number
}

// API Functions

// Auth
export const authApi = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>("/auth/login", data),

    register: (data: RegisterRequest) =>
        api.post<AuthResponse>("/auth/register", data),

    logout: () =>
        api.post("/auth/logout"),

    me: () =>
        api.get<User>("/auth/me"),

    refresh: (refreshToken: string) =>
        api.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken }),
}

// Campaigns
export const campaignsApi = {
    list: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get<{ campaigns: Campaign[]; total: number }>("/campaigns", { params }),

    get: (id: string) =>
        api.get<Campaign>(`/campaigns/${id}`),

    create: (data: Partial<Campaign>) =>
        api.post<Campaign>("/campaigns", data),

    update: (id: string, data: Partial<Campaign>) =>
        api.put<Campaign>(`/campaigns/${id}`, data),

    delete: (id: string) =>
        api.delete(`/campaigns/${id}`),

    send: (id: string) =>
        api.post(`/campaigns/${id}/send`),

    schedule: (id: string, scheduledAt: string) =>
        api.post(`/campaigns/${id}/schedule`, { scheduled_at: scheduledAt }),
}

// Subscribers
export const subscribersApi = {
    list: (params?: { status?: string; tag?: string; page?: number; limit?: number }) =>
        api.get<{ subscribers: Subscriber[]; total: number }>("/subscribers", { params }),

    get: (id: string) =>
        api.get<Subscriber>(`/subscribers/${id}`),

    create: (data: Partial<Subscriber>) =>
        api.post<Subscriber>("/subscribers", data),

    update: (id: string, data: Partial<Subscriber>) =>
        api.put<Subscriber>(`/subscribers/${id}`, data),

    delete: (id: string) =>
        api.delete(`/subscribers/${id}`),

    addTag: (id: string, tag: string) =>
        api.post(`/subscribers/${id}/tags`, { tag }),

    removeTag: (id: string, tag: string) =>
        api.delete(`/subscribers/${id}/tags/${tag}`),

    import: (file: File) => {
        const formData = new FormData()
        formData.append("file", file)
        return api.post("/subscribers/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
    },

    export: () =>
        api.get("/subscribers/export", { responseType: "blob" }),
}

// Analytics
export const analyticsApi = {
    overview: (params?: { start_date?: string; end_date?: string }) =>
        api.get<AnalyticsOverview>("/analytics/overview", { params }),

    subscriberGrowth: (params?: { start_date?: string; end_date?: string }) =>
        api.get<{ date: string; count: number }[]>("/analytics/subscriber-growth", { params }),

    campaignPerformance: () =>
        api.get<Campaign[]>("/analytics/campaign-performance"),

    trackOpen: (campaignId: string, subscriberId: string) =>
        api.post(`/analytics/track/open/${campaignId}/${subscriberId}`),

    trackClick: (campaignId: string, subscriberId: string, linkId: string) =>
        api.post(`/analytics/track/click/${campaignId}/${subscriberId}/${linkId}`),
}

// Referrals
export const referralsApi = {
    stats: () =>
        api.get<ReferralStats>("/referrals/stats"),

    leaderboard: () =>
        api.get<{ user_id: string; name: string; referrals: number; conversions: number }[]>("/referrals/leaderboard"),

    generateCode: () =>
        api.post<{ code: string }>("/referrals/code"),

    trackClick: (code: string) =>
        api.post(`/referrals/track/${code}`),
}

// Payments
export const paymentsApi = {
    plans: () =>
        api.get<{ id: string; name: string; price: number; interval: string; features: string[] }[]>("/subscriptions/plans"),

    currentSubscription: () =>
        api.get<{ plan: string; status: string; expires_at: string }>("/subscriptions/current"),

    subscribe: (planId: string, paymentMethod: string) =>
        api.post("/subscriptions/subscribe", { plan_id: planId, payment_method: paymentMethod }),

    cancel: () =>
        api.post("/subscriptions/cancel"),

    history: () =>
        api.get<{ id: string; amount: number; status: string; created_at: string }[]>("/payments/history"),

    initializePaystack: (amount: number, email: string) =>
        api.post<{ authorization_url: string; reference: string }>("/payments/paystack/initialize", { amount, email }),
}

// Admin
export const adminApi = {
    stats: () =>
        api.get<{ users: number; subscribers: number; campaigns: number; revenue: number }>("/admin/stats"),

    users: () =>
        api.get<User[]>("/admin/users"),

    revenueStats: () =>
        api.get<{ total: number; monthly: number; growth: number }>("/admin/revenue"),
}

export default api
