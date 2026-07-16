import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-6 py-24 text-center text-slate-100">
      <div className="max-w-xl rounded-[2rem] border border-slate-800 bg-slate-900/90 p-12 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase text-slate-500">404 error</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-4 text-slate-400">The route you attempted does not exist or has been moved. Please return to the dashboard.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
