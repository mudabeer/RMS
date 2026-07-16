import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <Card title="Settings" description="Manage your application preferences.">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Dark mode</h2>
            <p className="mt-2 text-sm text-slate-400">The application uses a dark theme by default.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Account</h2>
            <p className="mt-2 text-sm text-slate-400">Manage your account preferences and notifications.</p>
          </div>
          <Button variant="secondary">Save preferences</Button>
        </div>
      </Card>
    </div>
  )
}
