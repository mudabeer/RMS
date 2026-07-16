import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ApiResponse, RoomDto } from '../../types/api'
import { getRoomById, deleteRoom, updateRoom, generateVco } from '../../services/room'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'

const schema = z.object({ name: z.string().min(3, 'Room name must be at least 3 characters') })

type RoomNameInput = z.infer<typeof schema>

export function RoomDetailsPage() {
  const { roomId } = useParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data, isLoading } = useQuery<ApiResponse<RoomDto>>({
    queryKey: ['room', roomId],
    queryFn: () => (roomId ? getRoomById(roomId) : Promise.reject(new Error('Missing room id'))),
    enabled: Boolean(roomId),
  })
  const { register, handleSubmit, formState } = useForm<RoomNameInput>({ resolver: zodResolver(schema) })

  const room = data?.data
  const isCreator = room?.creator === user?.userId

  const updateMutation = useMutation({
    mutationFn: (name: string) => updateRoom(roomId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      alert('Room updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRoom(roomId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      window.location.href = '/rooms'
    },
  })

  const vcoMutation = useMutation({
    mutationFn: () => generateVco(room?.roomCode ?? ''),
    onSuccess: () => alert('Verification code sent to the room creator'),
  })

  const onSubmit = (values: RoomNameInput) => {
    updateMutation.mutate(values.name)
  }

  if (isLoading) return <div>Loading...</div>

  if (!room) return <div>Room not found</div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{room.name}</h1>
            <p className="text-sm text-slate-400">Room code: {room.roomCode}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isCreator ? (
              <Button variant="secondary" onClick={() => vcoMutation.mutate()}>
                Request VCO
              </Button>
            ) : null}
            <Button onClick={() => window.location.href = `/transactions/${room._id}/create`}>Create transaction</Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Room members">
            <div className="space-y-3">
              {room.members.map((member) => (
                <div key={member.user} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="font-medium text-slate-100">{member.user}</p>
                  <p className="text-sm text-slate-400">Role: {member.role}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Room management">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Rename room</span>
                <input defaultValue={room.name} {...register('name')} className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 outline-none" />
                {formState.errors.name && <p className="text-sm text-rose-400">{formState.errors.name.message}</p>}
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit">Save changes</Button>
                {isCreator ? (
                  <Button variant="ghost" onClick={() => deleteMutation.mutate()}>
                    Delete room
                  </Button>
                ) : null}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
