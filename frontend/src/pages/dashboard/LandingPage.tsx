import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { LayoutDashboard, Users, Wallet } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-24">
        <div className="grid gap-8 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/40 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
              <LayoutDashboard className="h-4 w-4" /> Room management simplified
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-white">Manage shared expenses, rooms, and debts from one dashboard.</h1>
            <p className="max-w-xl text-lg text-slate-400">Connect your account, invite members, create transactions and settle debts with confidence.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button>Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Create account</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-950/80 p-8 text-slate-200 shadow-inner shadow-slate-950/20">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-800 p-6">
                <p className="text-sm text-slate-400">Rooms</p>
                <p className="mt-3 text-3xl font-semibold">Create groups for every expense.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 p-6">
                <p className="text-sm text-slate-400">Transactions</p>
                <p className="mt-3 text-3xl font-semibold">Track payments and shared debts.</p>
              </div>
              <div className="rounded-3xl border border-slate-800 p-6">
                <p className="text-sm text-slate-400">Settlements</p>
                <p className="mt-3 text-3xl font-semibold">Pay debts directly and stay balanced.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, title: 'Invite members', description: 'Add people to rooms and manage roles.' },
            { icon: Wallet, title: 'Build transactions', description: 'Create shared expenses with custom splits.' },
            { icon: LayoutDashboard, title: 'Track totals', description: 'See owed and owing balances at a glance.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <item.icon className="h-6 w-6 text-sky-300" />
              <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
