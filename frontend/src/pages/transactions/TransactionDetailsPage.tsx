import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ApiResponse, TransactionDto } from '../../types/api'
import { getTransaction, deleteTransaction, payDebt } from '../../services/transaction'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ payment: z.number().positive('Payment must be positive') })

type PaymentInput = z.infer<typeof schema>

export function TransactionDetailsPage() {
  const { roomId, transactionId } = useParams()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery<ApiResponse<TransactionDto>>({
    queryKey: ['transaction', transactionId],
    queryFn: () => (roomId && transactionId ? getTransaction(roomId, transactionId) : Promise.reject(new Error('Missing ids'))),
    enabled: Boolean(roomId && transactionId),
  })
  const transaction = data?.data

  const paymentMutation = useMutation({
    mutationFn: (payload: PaymentInput) =>
      payDebt(roomId!, transactionId!, transaction?.splitAmong?.[0]?.userId ?? '', payload.payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
      alert('Payment recorded')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(roomId!, transactionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      window.location.href = '/transactions'
    },
  })

  const { register, handleSubmit, formState } = useForm<PaymentInput>({ resolver: zodResolver(schema) })

  const onSubmit = (values: PaymentInput) => paymentMutation.mutate(values)

  if (isLoading) return <div>Loading...</div>
  if (!transaction) return <div>Transaction not found</div>

  return (
    <div className="space-y-8">
      <Card title={transaction.title} description={`Amount: $${transaction.amount}`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Category</h3>
            <p className="mt-2 text-lg text-slate-100">{transaction.category}</p>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-500">Payment status</h3>
            <p className="mt-2 text-lg text-slate-100">{transaction.splitAmong.some((item) => item.status !== 'Paid') ? 'Pending' : 'Paid'}</p>
          </div>
        </div>
      </Card>
      <Card title="Debt breakup">
        <div className="space-y-3">
          {transaction.splitAmong.map((debt) => (
            <div key={debt.userId} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="font-medium text-slate-100">User: {debt.userId}</p>
              <p className="text-sm text-slate-400">Debt amount: ${debt.debtAmount}</p>
              <p className="text-sm text-slate-400">Paid: ${debt.paidAmount}</p>
              <p className="text-sm text-slate-400">Status: {debt.status}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Record payment">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Amount</span>
              <input type="number" step="0.01" {...register('payment', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" />
              {formState.errors.payment && <p className="text-sm text-rose-400">{formState.errors.payment.message}</p>}
            </label>
            <div className="flex gap-3 flex-wrap">
              <Button type="submit">Pay debt</Button>
              <Button variant="ghost" onClick={() => deleteMutation.mutate()}>Delete transaction</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
