import {
  LayoutDashboard, MessageSquare, Stethoscope, FileText,
  User, Settings, ShieldCheck, Plus, ChevronLeft,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChat } from '../../hooks/useChat'
import { classNames } from '../../utils/helpers'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/medical', icon: Stethoscope, label: 'Medical Tools' },
  { to: '/upload', icon: FileText, label: 'Documents' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuthStore()
  const { createChat } = useChat()
  const navigate = useNavigate()

  const handleNewChat = async () => {
    const chat = await createChat()
    if (chat) navigate(`/chat/${chat.id}`)
  }

  return (
    <aside
      className={classNames(
        'h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 shrink-0',
        isOpen ? 'w-60' : 'w-0 overflow-hidden',
      )}
    >
      <div className="flex flex-col h-full p-3 gap-1 min-w-[240px]">
        {/* New Chat button */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-150 text-sm font-medium mb-2"
        >
          <Plus size={16} />
          New Chat
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                classNames('sidebar-item', isActive ? 'active' : '')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                classNames('sidebar-item', isActive ? 'active' : '')
              }
            >
              <ShieldCheck size={18} />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Version */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-1">
            MedGPT v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
