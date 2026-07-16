import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiResponse, Paginated, TransactionDto } from '../../types/api'
import { getRoomTransactions } from '../../services/transaction'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery<ApiResponse<Paginated<TransactionDto>>>({
    queryKey: ['transactions', search],
    queryFn: () => getRoomTransactions('', { search, page: 1, limit: 20 }),
  })
  const transactions = data?.data?.transactions ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-slate-400">Review shared expenses and settle debts.</p>
        </div>
        <Link to="/transactions/create">
          <Button>Create transaction</Button>
        </Link>
      </div>
      <div className="grid gap-6">
        <input
          placeholder="Search transactions"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500"
        />
        {isLoading ? (
          <Card title="Loading transactions">Fetching your latest transactions...</Card>
        ) : transactions.length === 0 ? (
          <Card title="No transactions">Start recording shared expenses in a room.</Card>
        ) : (
          transactions.map((transaction: TransactionDto) => (
            <Card key={transaction._id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{transaction.title}</h2>
                  <p className="text-sm text-slate-400">Amount: ${transaction.amount}</p>
                </div>
                <Link className="text-sky-400 hover:text-sky-300" to={`/transactions/${transaction.roomId}/${transaction._id}`}>
                  View details
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
