import { useEffect, useState } from 'react'
import { Users, MessageSquare, FileText, Activity, Trash2, Shield, UserCheck, UserX } from 'lucide-react'
import { adminService } from '../services/chat'
import type { Stats, User } from '../types'
import { formatFullDate, getRoleColor, getInitials } from '../utils/helpers'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export default function AdminPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, u] = await Promise.all([adminService.getStats(), adminService.getUsers()])
      setStats(s)
      setUsers(u)
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const updated = await adminService.updateUserRole(userId, newRole)
      setUsers((u) => u.map((x) => (x.id === userId ? updated : x)))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleStatusToggle = async (userId: number, isActive: boolean) => {
    try {
      const updated = await adminService.updateUserStatus(userId, !isActive)
      setUsers((u) => u.map((x) => (x.id === userId ? updated : x)))
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await adminService.deleteUser(userId)
      setUsers((u) => u.filter((x) => x.id !== userId))
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Shield size={24} className="text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage users and view system statistics</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.users.total, sub: `${stats.users.active} active`, color: 'text-blue-600' },
            { icon: MessageSquare, label: 'Total Chats', value: stats.chats.total, sub: `${stats.messages.total} messages`, color: 'text-emerald-600' },
            { icon: FileText, label: 'Documents', value: stats.documents.total, sub: `${stats.documents.processed} processed`, color: 'text-violet-600' },
            { icon: Activity, label: 'Inactive Users', value: stats.users.inactive, sub: 'Need attention', color: 'text-orange-600' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Icon size={18} className={color} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(u.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{u.full_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user?.id}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium focus:ring-1 focus:ring-primary-500 cursor-pointer ${getRoleColor(u.role)}`}
                    >
                      <option value="user">USER</option>
                      <option value="doctor">DOCTOR</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{formatFullDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.id !== user?.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.full_name)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
