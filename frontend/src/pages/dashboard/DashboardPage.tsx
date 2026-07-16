import { useQuery } from '@tanstack/react-query'
import { ApiResponse, Paginated, RoomDto } from '../../types/api'
import { getRooms } from '../../services/room'
import { Card } from '../../components/ui/Card'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data, isLoading } = useQuery<ApiResponse<Paginated<RoomDto>>>({
    queryKey: ['rooms', { page: 1, limit: 5 }],
    queryFn: () => getRooms({ page: 1, limit: 5 }),
  })

  const rooms = data?.data?.rooms ?? []
  const totalRooms = data?.data?.totalRooms ?? 0
  const recentRooms = rooms.slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <Card title="Total rooms" description="Rooms you are part of">
          <p className="text-4xl font-semibold text-slate-100">{totalRooms}</p>
        </Card>
        <Card title="Pending" description="Pending debts and rooms">
          <p className="text-4xl font-semibold text-slate-100">—</p>
        </Card>
        <Card title="Owed to you" description="Amounts other members owe you">
          <p className="text-4xl font-semibold text-slate-100">—</p>
        </Card>
        <Card title="You owe" description="Your pending payments">
          <p className="text-4xl font-semibold text-slate-100">—</p>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Recent rooms" description="Latest rooms you've joined">
          {isLoading ? (
            <p className="text-slate-500">Loading rooms...</p>
          ) : recentRooms.length === 0 ? (
            <p className="text-slate-400">No rooms yet. Create or join a new room.</p>
          ) : (
            <div className="space-y-4">
              {recentRooms.map((room) => (
                <div key={room._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <h3 className="font-semibold text-slate-100">{room.name}</h3>
                  <p className="text-sm text-slate-400">Code: {room.roomCode}</p>
                  <Link className="text-sm text-sky-400 hover:text-sky-300" to={`/rooms/${room._id}`}>
                    View room
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Quick actions" description="Get started faster">
          <div className="space-y-3">
            <Link className="block rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-slate-200 transition hover:border-sky-500/30 hover:bg-slate-900" to="/rooms/create">
              Create a room
            </Link>
            <Link className="block rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-slate-200 transition hover:border-sky-500/30 hover:bg-slate-900" to="/rooms/join">
              Join with verification code
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
