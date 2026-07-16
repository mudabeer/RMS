import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-24">
        <Card title="Verify OTP" description="Enter the code sent to your email to complete registration.">
          <p className="text-sm text-slate-400">OTP verification is handled during registration. If you have already entered the code, simply log in.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login">
              <Button>Go to login</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Continue registration</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
