import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { register as registerService, sendCode } from '../../services/auth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  otp: z.string().length(6, 'Enter a 6-digit OTP'),
})

type RegisterInput = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState, watch } = useForm<RegisterInput>({ resolver: zodResolver(schema) })

  const onSendCode = async () => {
    const email = watch('email')
    if (!email) return
    try {
      await sendCode({ email })
      alert('Verification code sent to your email')
    } catch (error: any) {
      alert(error.response?.data?.msg ?? error.message)
    }
  }

  const onSubmit = async (values: RegisterInput) => {
    try {
      const response = await registerService(values)
      if (response.success) {
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
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-slate-400">Sign up with email, verify your code, and start tracking shared bills.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Name</span>
              <Input type="text" placeholder="Your name" {...register('name')} />
              {formState.errors.name && <p className="text-sm text-rose-400">{formState.errors.name.message}</p>}
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
              {formState.errors.email && <p className="text-sm text-rose-400">{formState.errors.email.message}</p>}
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Password</span>
                <Input type="password" placeholder="••••••••" {...register('password')} />
                {formState.errors.password && <p className="text-sm text-rose-400">{formState.errors.password.message}</p>}
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span>OTP</span>
                <Input type="text" placeholder="123456" {...register('otp')} />
                {formState.errors.otp && <p className="text-sm text-rose-400">{formState.errors.otp.message}</p>}
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="secondary" onClick={onSendCode}>
                Send verification code
              </Button>
              <Button type="submit">Register</Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
