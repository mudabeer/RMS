import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { resetPassword } from '../../services/auth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  newPassword: z.string().min(6, 'Password must have at least 6 characters'),
})

type ResetPasswordInput = z.infer<typeof schema>

export function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<ResetPasswordInput>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: ResetPasswordInput) => {
    if (!token) return
    try {
      const response = await resetPassword(token, values)
      if (response.success) {
        alert('Password reset successful')
        navigate('/login')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-24">
        <div className="w-full rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/40">
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-slate-400">Enter a new password to regain access to your account.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>New password</span>
              <Input type="password" placeholder="••••••••" {...register('newPassword')} />
              {formState.errors.newPassword && <p className="text-sm text-rose-400">{formState.errors.newPassword.message}</p>}
            </label>
            <Button type="submit">Save password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
