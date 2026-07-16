import { ApiResponse, Paginated, RoomDto } from '../types/api'
import axios from '../api/axios'

type CreateRoomInput = { roomName: string }
type JoinRoomInput = { vco: string }

type GetRoomsParams = {
  search?: string
  roomCode?: string
  sort?: string
  page?: number
  limit?: number
}

export const getRooms = async (params: GetRoomsParams = {}) => {
  const response = await axios.get<ApiResponse<Paginated<RoomDto>>>('/room', { params })
  return response.data
}

export const getRoomById = async (roomId: string) => {
  const response = await axios.get<ApiResponse<RoomDto>>(`/room/${roomId}`)
  return response.data
}

export const createRoom = async (payload: CreateRoomInput) => {
  const response = await axios.post<ApiResponse<RoomDto>>('/room', payload)
  return response.data
}

export const generateVco = async (roomCode: string) => {
  const response = await axios.post<ApiResponse>('/room/gen-vco', { roomCode })
  return response.data
}

export const joinRoom = async (payload: JoinRoomInput) => {
  const response = await axios.patch<ApiResponse>('/room/join-room', payload)
  return response.data
}

export const updateRoom = async (roomId: string, name: string) => {
  const response = await axios.patch<ApiResponse>(`/room/${roomId}`, { name })
  return response.data
}

export const deleteRoom = async (roomId: string) => {
  const response = await axios.delete<ApiResponse>(`/room/${roomId}`)
  return response.data
}

export const updateMemberRole = async (roomId: string, memberId: string, role: string) => {
  const response = await axios.patch<ApiResponse>(`/room/${roomId}/member/${memberId}`, { role })
  return response.data
}

export const deleteMember = async (roomId: string, memberId: string) => {
  const response = await axios.delete<ApiResponse>(`/room/${roomId}/member/${memberId}`)
  return response.data
}
