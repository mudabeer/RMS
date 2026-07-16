import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
})

type LoginInput = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-24">
        <div className="w-full rounded-[2rem] border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/40">
          <h1 className="text-3xl font-semibold">Log in to RMS</h1>
          <p className="mt-2 text-slate-400">Enter your account details to manage rooms, transactions, and debts.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
              {formState.errors.email && <p className="text-sm text-rose-400">{formState.errors.email.message}</p>}
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Password</span>
              <Input type="password" placeholder="••••••••" {...register('password')} />
              {formState.errors.password && <p className="text-sm text-rose-400">{formState.errors.password.message}</p>}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/forgot-password" className="text-sm text-sky-400 hover:text-sky-300">Forgot password?</Link>
              <Button type="submit">Continue</Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
