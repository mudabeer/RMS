import { ApiResponse, Paginated, TransactionDto } from '../types/api'
import axios from '../api/axios'

type CreateTransactionInput = {
  roomId: string
  title: string
  amount: number
  category: string
  splitType: 'allRoomMember' | 'custom'
  members?: string[]
}

type UpdateTransactionInput = {
  title?: string
  category?: string
}

type GetTransactionsParams = {
  search?: string
  amount?: string
  category?: string
  paidBy?: string
  debts?: string
  debtAmount?: string
  status?: string
  sort?: string
  numericFilters?: string
  page?: number
  limit?: number
}

export const getRoomTransactions = async (roomId: string, params: GetTransactionsParams = {}) => {
  const response = await axios.get<ApiResponse<Paginated<TransactionDto>>>(`/transaction/${roomId}/`, { params })
  return response.data
}

export const getTransaction = async (roomId: string, transactionId: string) => {
  const response = await axios.get<ApiResponse<TransactionDto>>(`/transaction/${roomId}/${transactionId}`)
  return response.data
}

export const createTransaction = async (payload: CreateTransactionInput) => {
  const response = await axios.post<ApiResponse>(`/transaction/${payload.roomId}/`, payload)
  return response.data
}

export const updateTransaction = async (roomId: string, transactionId: string, payload: UpdateTransactionInput) => {
  const response = await axios.patch<ApiResponse>(`/transaction/${roomId}/${transactionId}`, payload)
  return response.data
}

export const deleteTransaction = async (roomId: string, transactionId: string) => {
  const response = await axios.delete<ApiResponse>(`/transaction/${roomId}/${transactionId}`)
  return response.data
}

export const payDebt = async (roomId: string, transactionId: string, memberId: string, payment: number) => {
  const response = await axios.patch<ApiResponse>(`/transaction/${roomId}/${transactionId}/payment/${memberId}`, { payment })
  return response.data
}
