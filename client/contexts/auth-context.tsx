"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    authApi,
    setTokens,
    clearTokens,
    getAccessToken,
    User,
    LoginRequest,
    RegisterRequest
} from "@/lib/api"

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const refreshUser = useCallback(async () => {
        try {
            const token = getAccessToken()
            if (!token) {
                setUser(null)
                setIsLoading(false)
                return
            }

            const response = await authApi.me()
            setUser(response.data)
        } catch (error) {
            console.error("Failed to refresh user:", error)
            setUser(null)
            clearTokens()
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = async (data: LoginRequest) => {
        setIsLoading(true)
        try {
            const response = await authApi.login(data)
            const { user, access_token, refresh_token } = response.data

            setTokens(access_token, refresh_token)
            setUser(user)

            router.push("/dashboard")
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (data: RegisterRequest) => {
        setIsLoading(true)
        try {
            const response = await authApi.register(data)
            const { user, access_token, refresh_token } = response.data

            setTokens(access_token, refresh_token)
            setUser(user)

            router.push("/dashboard")
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await authApi.logout()
        } catch (error) {
            // Ignore logout errors
        } finally {
            clearTokens()
            setUser(null)
            setIsLoading(false)
            router.push("/login")
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Protected route wrapper component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

// Admin route wrapper
export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "admin")) {
            router.push("/dashboard")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user || user.role !== "admin") {
        return null
    }

    return <>{children}</>
}
