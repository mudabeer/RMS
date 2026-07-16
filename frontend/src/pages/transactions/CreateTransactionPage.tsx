import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTransaction } from '../../services/transaction'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  roomId: z.string().min(1, 'Room id is required'),
  title: z.string().min(3, 'Title must have at least 3 characters'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(2, 'Category is required'),
  splitType: z.enum(['allRoomMember', 'custom']),
  members: z.string().optional(),
})

type CreateTransactionInput = z.infer<typeof schema>

export function CreateTransactionPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, control, formState } = useForm<CreateTransactionInput>({
    resolver: zodResolver(schema),
    defaultValues: { splitType: 'allRoomMember' },
  })
  const splitType = useWatch({ control, name: 'splitType' })

  const onSubmit = async (values: CreateTransactionInput) => {
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        members: values.members ? values.members.split(',').map((value) => value.trim()) : undefined,
      }
      const response = await createTransaction(payload)
      if (response.success) {
        alert('Transaction created successfully')
        navigate('/transactions')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <Card title="Create transaction" description="Log an expense and split it across room members.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Room ID</span>
            <Input placeholder="Room ID" {...register('roomId')} />
            {formState.errors.roomId && <p className="text-sm text-rose-400">{formState.errors.roomId.message}</p>}
          </label>
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Amount</span>
            <Input type="number" placeholder="100" step="0.01" {...register('amount', { valueAsNumber: true })} />
            {formState.errors.amount && <p className="text-sm text-rose-400">{formState.errors.amount.message}</p>}
          </label>
        </div>
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Title</span>
          <Input placeholder="Dinner at a restaurant" {...register('title')} />
          {formState.errors.title && <p className="text-sm text-rose-400">{formState.errors.title.message}</p>}
        </label>
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Category</span>
          <Input placeholder="Food" {...register('category')} />
          {formState.errors.category && <p className="text-sm text-rose-400">{formState.errors.category.message}</p>}
        </label>
        <label className="block space-y-2 text-sm text-slate-200">
          <span>Split type</span>
          <select {...register('splitType')} className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500">
            <option value="allRoomMember">All room members</option>
            <option value="custom">Custom members</option>
          </select>
        </label>
        {splitType === 'custom' ? (
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Member IDs (comma-separated)</span>
            <Input placeholder="memberId1, memberId2" {...register('members')} />
          </label>
        ) : null}
        <Button type="submit">Save transaction</Button>
      </form>
    </Card>
  )
}
