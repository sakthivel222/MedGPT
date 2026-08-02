import { useEffect, useState } from 'react'
import { MessageSquare, FileText, Stethoscope, Activity, Plus, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChat } from '../hooks/useChat'
import { chatService } from '../services/chat'
import { formatChatDate } from '../utils/helpers'
import Button from '../components/ui/Button'

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'New Chat', desc: 'Start a conversation with MedGPT', color: 'bg-blue-500', to: '/chat' },
  { icon: Stethoscope, label: 'Check Symptoms', desc: 'Analyze your symptoms with AI', color: 'bg-emerald-500', to: '/medical' },
  { icon: FileText, label: 'Upload PDF', desc: 'Upload medical documents for RAG', color: 'bg-violet-500', to: '/upload' },
  { icon: Activity, label: 'BMI Calculator', desc: 'Calculate and analyze your BMI', color: 'bg-orange-500', to: '/medical' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { chats, loadChats, createChat } = useChat()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalChats: 0, totalMessages: 0 })

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    setStats({ totalChats: chats.length, totalMessages: chats.reduce((a, c) => a + c.message_count, 0) })
  }, [chats])

  const handleNewChat = async () => {
    const chat = await createChat()
    if (chat) navigate(`/chat/${chat.id}`)
  }

  const recentChats = chats.slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your MedGPT dashboard. How can I help you today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Chats', value: stats.totalChats, icon: MessageSquare, color: 'text-blue-600' },
          { label: 'Messages Sent', value: stats.totalMessages, icon: Activity, color: 'text-emerald-600' },
          { label: 'Role', value: user?.role?.toUpperCase() || '—', icon: Stethoscope, color: 'text-violet-600' },
          { label: 'Account', value: user?.is_verified ? 'Verified' : 'Active', icon: FileText, color: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, to }) => (
            <button
              key={label}
              onClick={() => label === 'New Chat' ? handleNewChat() : navigate(to)}
              className="card p-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Chats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Chats</h2>
          <button onClick={() => navigate('/chat')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        {recentChats.length ? (
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full card px-4 py-3 flex items-center gap-3 hover:shadow-md transition-all duration-200 text-left"
              >
                <MessageSquare size={18} className="text-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{chat.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{chat.message_count} messages · {formatChatDate(chat.updated_at)}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No chats yet. Start your first conversation!</p>
            <Button onClick={handleNewChat} icon={<Plus size={16} />} className="mt-4" size="sm">New Chat</Button>
          </div>
        )}
      </div>
    </div>
  )
}
