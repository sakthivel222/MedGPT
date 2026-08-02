import { useState } from 'react'
import { User, Mail, Shield, Calendar, Save } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { formatFullDate, getInitials, getRoleColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const handleSaveProfile = async () => {
    setLoading(true)
    await updateProfile({ full_name: fullName })
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast.error('Fill in all password fields'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return }
    setPwLoading(true)
    try {
      await authService.changePassword(currentPw, newPw)
      toast.success('Password changed successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account information and password</p>
      </div>

      {/* Avatar + info */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {getInitials(user.full_name)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge ${getRoleColor(user.role)}`}>{user.role.toUpperCase()}</span>
            <span className={`badge ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Account Information</h3>
        <div className="grid gap-3">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: User, label: 'Username', value: `@${user.username}` },
            { icon: Shield, label: 'Role', value: user.role },
            { icon: Calendar, label: 'Member since', value: formatFullDate(user.created_at) },
            { icon: Calendar, label: 'Last login', value: user.last_login ? formatFullDate(user.last_login) : 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <Icon size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-28 shrink-0">{label}</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h3>
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Button onClick={handleSaveProfile} loading={loading} icon={<Save size={16} />}>Save Changes</Button>
      </div>

      {/* Change password */}
      <div className="card p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Change Password</h3>
        <Input label="Current password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
        <Input label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} hint="At least 8 characters" />
        <Input label="Confirm new password" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        <Button onClick={handleChangePassword} loading={pwLoading} variant="secondary" icon={<Shield size={16} />}>
          Change Password
        </Button>
      </div>
    </div>
  )
}
