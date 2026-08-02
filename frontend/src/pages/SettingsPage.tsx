import { useState } from 'react'
import { Settings, Moon, Sun, Bell, Trash2, AlertTriangle } from 'lucide-react'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'))
  const [notifications, setNotifications] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDarkMode(!darkMode)
    toast.success(`Switched to ${!darkMode ? 'dark' : 'light'} mode`)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await api.delete('/users/me')
      toast.success('Account deleted')
      logout()
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
      setDeleteModal(false)
    }
  }

  const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your MedGPT experience</p>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          {darkMode ? <Moon size={18} /> : <Sun size={18} />} Appearance
        </h3>
        <ToggleRow label="Dark mode" desc="Use dark theme throughout the app" checked={darkMode} onChange={toggleDark} />
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          <Bell size={18} /> Notifications
        </h3>
        <ToggleRow
          label="App notifications"
          desc="Show toast notifications for actions"
          checked={notifications}
          onChange={() => { setNotifications(!notifications); toast.success('Preference saved') }}
        />
      </div>

      {/* About */}
      <div className="card p-6 space-y-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings size={18} /> About MedGPT
        </h3>
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Model', value: 'Ollama (local)' },
          { label: 'Stack', value: 'FastAPI + React + ChromaDB' },
          { label: 'License', value: 'MIT' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-200 dark:border-red-900/50 space-y-3">
        <h3 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle size={18} /> Danger Zone
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setDeleteModal(true)}>
          Delete Account
        </Button>
      </div>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle size={20} />
            <p className="text-sm">This action is irreversible. All your chats and documents will be permanently deleted.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteAccount} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
