import { create } from 'zustand'
import {
    setAccessToken,
    setRefreshTokenCookie,
    clearAuthCookies,
    getRefreshTokenCookie,
} from '@/lib/api'
import { getCurrentUser } from '@/lib/requests/auth'
import type { User } from '@/types/auth'

interface AuthState {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
}

const useAuthStore = create<AuthState>()(() => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
}))

export const useUser = () => useAuthStore((s) => s.user)
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated)
export const useAuthLoading = () => useAuthStore((s) => s.isLoading)

export const AuthActions = {
    setTokens(accessToken: string, refreshToken: string, user: User) {
        setAccessToken(accessToken)
        setRefreshTokenCookie(refreshToken)
        useAuthStore.setState({
            user,
            isAuthenticated: true,
            isLoading: false,
        })
    },

    logout() {
        setAccessToken(null)
        clearAuthCookies()
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        })
    },

    async initialize() {
        const hasRefresh = !!getRefreshTokenCookie()
        if (!hasRefresh) {
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            })
            return
        }

        try {
            const { user } = await getCurrentUser()
            useAuthStore.setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            })
        } catch {
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },
}

export default useAuthStore
