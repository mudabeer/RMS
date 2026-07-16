import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/layout/Sidebar'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function AppShell() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 p-6 lg:px-10">
          <header className="mb-8 flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-4 shadow-xl shadow-slate-950/20 lg:hidden">
            <div className="flex items-center gap-3">
              <Menu className="h-5 w-5 text-slate-300" />
              <div>
                <p className="text-sm text-slate-400">Welcome back</p>
                <p className="font-semibold">{user?.userName ?? 'Guest'}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => logout().then(() => navigate('/login'))}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
