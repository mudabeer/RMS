export type ApiResponse<T = unknown> = {
  success: boolean
  msg: string
  data?: T
}

export type Paginated<T> = {
  rooms?: T[]
  transactions?: T[]
  totalRooms?: number
  totaltransactionss?: number
  numOfPages?: number
}

export type UserDto = {
  userId: string
  userName: string
}

export type RoomDto = {
  _id: string
  name: string
  roomCode: string
  creator: string
  members: Array<{ user: string; role: 'creator' | 'admin' | 'member' }>
  createdAt: string
  updatedAt: string
}

export type TransactionDto = {
  _id: string
  title: string
  amount: number
  category: string
  roomId: string
  shareAmount: number
  paidBy: string
  splitAmong: Array<{ userId: string; debtAmount: number; paidAmount: number; status: 'Pending' | 'Paid' | 'Partial' }>
  createdAt: string
  updatedAt: string
}

export type AuthState = {
  isAuthenticated: boolean
  loading: boolean
  user: UserDto | null
}
