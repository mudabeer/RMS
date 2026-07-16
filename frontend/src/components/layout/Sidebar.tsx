import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Wallet, PlusCircle, Settings, User, LogOut, Grid } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Rooms', to: '/rooms', icon: Users },
  { label: 'Transactions', to: '/transactions', icon: Wallet },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-6 border-r border-slate-800 p-6 lg:flex lg:min-h-screen lg:bg-slate-950/90">
      <div className="space-y-2">
        <div className="rounded-3xl bg-slate-900 p-4 text-slate-100 shadow-inner shadow-slate-950/20">RMS Dashboard</div>
        <p className="text-sm text-slate-400">Track rooms, transactions, and settle debts in one place.</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-sky-500/10 text-sky-300' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
