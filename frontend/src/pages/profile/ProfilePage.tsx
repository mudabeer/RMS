import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <Card title="Your profile" description="Manage your account details.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm text-slate-400">Name</p>
            <p className="mt-2 text-lg text-slate-100">{user?.userName ?? 'Unknown'}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm text-slate-400">User id</p>
            <p className="mt-2 text-lg text-slate-100">{user?.userId ?? 'Unknown'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
