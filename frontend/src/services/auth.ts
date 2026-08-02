import api from './api'
import type { AuthTokens, User } from '../types'

interface RegisterData {
  email: string
  username: string
  full_name: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/register', data)
    return response.data
  },

  async login(data: LoginData): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>('/auth/login', data)
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  storeTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
  },

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },
}
