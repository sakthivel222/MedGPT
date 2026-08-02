import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold">MedGPT</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your AI-Powered<br />Medical Assistant
          </h1>
          <p className="text-primary-200 text-lg">
            Get instant answers to medical questions, analyze reports, check symptoms, and interact with your health documents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {['Symptom Analysis', 'Drug Interactions', 'Report Analysis', 'RAG on PDFs'].map((f) => (
            <div key={f} className="flex items-center gap-2 text-primary-200">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 lg:hidden">
              <Heart size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your MedGPT account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@example.com"
              icon={<Mail size={16} />}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              icon={<Lock size={16} />}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
