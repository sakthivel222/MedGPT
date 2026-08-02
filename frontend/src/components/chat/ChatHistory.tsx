import { Trash2, Archive, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { classNames, formatChatDate } from '../../utils/helpers'
import type { ChatList } from '../../types'
import { chatService } from '../../services/chat'
import { useChatStore } from '../../store/chatStore'

interface ChatHistoryProps {
  chats: ChatList[]
  onDelete: (id: number) => void
}

export default function ChatHistory({ chats, onDelete }: ChatHistoryProps) {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { updateChatTitle } = useChatStore()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (chat: ChatList, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const saveEdit = async (chatId: number) => {
    if (!editTitle.trim()) return
    await chatService.updateChat(chatId, { title: editTitle.trim() })
    updateChatTitle(chatId, editTitle.trim())
    setEditingId(null)
  }

  if (!chats.length) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">No chats yet. Start a new conversation!</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5 px-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className={classNames(
            'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150',
            String(chat.id) === chatId
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50',
          )}
        >
          {editingId === chat.id ? (
            <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(chat.id); if (e.key === 'Escape') setEditingId(null) }}
                className="flex-1 text-xs bg-transparent border-b border-primary-400 outline-none"
                autoFocus
              />
              <button onClick={() => saveEdit(chat.id)} className="text-green-500 hover:text-green-600"><Check size={12} /></button>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{chat.title}</p>
                <p className="text-xs opacity-60 mt-0.5">{formatChatDate(chat.updated_at)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => startEdit(chat, e)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(chat.id) }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
