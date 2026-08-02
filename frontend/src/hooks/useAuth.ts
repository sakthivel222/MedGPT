import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth'

export function useAuth() {
  const { user, isAuthenticated, logout: storeLogout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const tokens = await authService.login({ email, password })
      authService.storeTokens(tokens)
      setUser(tokens.user)
      toast.success(`Welcome back, ${tokens.user.full_name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    username: string
    full_name: string
    password: string
  }) => {
    setIsLoading(true)
    try {
      const tokens = await authService.register(data)
      authService.storeTokens(tokens)
      setUser(tokens.user)
      toast.success('Account created successfully! Welcome to MedGPT.')
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Registration failed.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    storeLogout()
    authService.clearTokens()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    setIsLoading(true)
    try {
      const { api } = await import('../services/api')
      const response = await api.patch('/users/me', data)
      setUser(response.data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return { user, isAuthenticated, isLoading, login, register, logout, updateProfile }
}
