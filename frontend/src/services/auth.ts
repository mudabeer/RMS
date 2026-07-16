import { ApiResponse } from '../types/api'
import axios from '../api/axios'

type SendCodeInput = { email: string }
type RegisterInput = { name: string; email: string; password: string; otp: string }
type LoginInput = { email: string; password: string }
type ForgotPasswordInput = { email: string }
type ResetPasswordInput = { newPassword: string }

export const sendCode = async (payload: SendCodeInput) => {
  const response = await axios.post<ApiResponse>('/auth/send-code', payload)
  return response.data
}

export const register = async (payload: RegisterInput) => {
  const response = await axios.post<ApiResponse>('/auth/register', payload)
  return response.data
}

export const login = async (payload: LoginInput) => {
  const response = await axios.post<ApiResponse>('/auth/login', payload)
  return response.data
}

export const logout = async () => {
  const response = await axios.post<ApiResponse>('/auth/logout')
  return response.data
}

export const refreshToken = async () => {
  const response = await axios.post<ApiResponse>('/auth/refresh')
  return response.data
}

export const forgotPassword = async (payload: ForgotPasswordInput) => {
  const response = await axios.post<ApiResponse>('/auth/forgot-password', payload)
  return response.data
}

export const resetPassword = async (token: string, payload: ResetPasswordInput) => {
  const response = await axios.post<ApiResponse>(`/auth/reset-password/${token}`, payload)
  return response.data
}
