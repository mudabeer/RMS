import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forgotPassword } from '../../services/auth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type ForgotPasswordInput = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm<ForgotPasswordInput>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      const response = await forgotPassword(values)
      if (response.success) {
        alert('Password reset link sent to your email')
      }
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-24">
        <div className="w-full rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/40">
          <h1 className="text-3xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-slate-400">Enter the email associated with your account and we will send a reset link.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
              {formState.errors.email && <p className="text-sm text-rose-400">{formState.errors.email.message}</p>}
            </label>
            <Button type="submit">Send reset link</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            <Link to="/login" className="text-sky-400 hover:text-sky-300">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
