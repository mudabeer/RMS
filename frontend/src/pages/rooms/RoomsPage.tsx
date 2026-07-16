import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiResponse, Paginated, RoomDto } from '../../types/api'
import { getRooms } from '../../services/room'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export function RoomsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery<ApiResponse<Paginated<RoomDto>>>({
    queryKey: ['rooms', search],
    queryFn: () => getRooms({ search, page: 1, limit: 20 }),
  })
  const rooms = data?.data?.rooms ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-slate-400">Browse and manage rooms that include you.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/rooms/create">
            <Button>Create room</Button>
          </Link>
          <Link to="/rooms/join">
            <Button variant="secondary">Join room</Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <input
            placeholder="Search rooms"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
          />
        </div>
        {isLoading ? (
          <Card title="Loading rooms">Please wait while we fetch your rooms.</Card>
        ) : rooms.length === 0 ? (
          <Card title="No rooms">You don't have any rooms yet. Create one to get started.</Card>
        ) : (
          rooms.map((room) => (
            <Card key={room._id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{room.name}</h2>
                  <p className="text-sm text-slate-400">Room code: {room.roomCode}</p>
                </div>
                <Link to={`/rooms/${room._id}`} className="text-sky-400 hover:text-sky-300">
                  View details
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                <span>Members: {room.members.length}</span>
                <span>Role: {room.members.find((member) => member.user === room.creator)?.role ?? 'member'}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
