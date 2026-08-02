import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, UserCircle, Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name) e.full_name = 'Full name is required'
    if (!form.username) e.username = 'Username is required'
    if (form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await register({ email: form.email, username: form.username, full_name: form.full_name, password: form.password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4">
            <Heart size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join MedGPT — your AI medical assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Dr. Jane Smith" icon={<UserCircle size={16} />} error={errors.full_name} />
          <Input label="Username" value={form.username} onChange={(e) => update('username', e.target.value)} placeholder="drjane" icon={<User size={16} />} error={errors.username} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@hospital.com" icon={<Mail size={16} />} error={errors.email} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 8 characters" icon={<Lock size={16} />} error={errors.password} hint="At least 8 characters" />
          <Input label="Confirm password" type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} placeholder="Repeat password" icon={<Lock size={16} />} error={errors.confirm} />

          <Button type="submit" loading={isLoading} className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
