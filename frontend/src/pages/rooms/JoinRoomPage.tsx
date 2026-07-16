import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { joinRoom } from '../../services/room'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const schema = z.object({
  vco: z.string().min(4, 'Enter a valid verification code'),
})

type JoinRoomInput = z.infer<typeof schema>

export function JoinRoomPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<JoinRoomInput>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: JoinRoomInput) => {
    try {
      const response = await joinRoom(values)
      if (response.success) {
        alert('Joined room successfully')
        navigate('/rooms')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <Card title="Join a room" description="Use the room verification code to join an existing room.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Verification code</span>
          <Input placeholder="Enter VCO" {...register('vco')} />
          {formState.errors.vco && <p className="text-sm text-rose-400">{formState.errors.vco.message}</p>}
        </label>
        <Button type="submit">Join room</Button>
      </form>
    </Card>
  )
}
