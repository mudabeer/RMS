import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createRoom } from '../../services/room'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const schema = z.object({
  roomName: z.string().min(3, 'Room name must be at least 3 characters'),
})

type CreateRoomInput = z.infer<typeof schema>

export function CreateRoomPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<CreateRoomInput>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: CreateRoomInput) => {
    try {
      const response = await createRoom(values)
      if (response.success) {
        alert('Room created successfully')
        navigate('/rooms')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <Card title="Create a room" description="Create a new shared space for your transactions.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Room name</span>
          <Input placeholder="Dinner out" {...register('roomName')} />
          {formState.errors.roomName && <p className="text-sm text-rose-400">{formState.errors.roomName.message}</p>}
        </label>
        <Button type="submit">Create room</Button>
      </form>
    </Card>
  )
}
