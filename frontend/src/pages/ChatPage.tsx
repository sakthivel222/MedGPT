import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import ChatHistory from '../components/chat/ChatHistory'
import { useChat } from '../hooks/useChat'
import Spinner from '../components/ui/Spinner'

export default function ChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { chats, activeChat, isLoading, loadChats, createChat, loadChat, deleteChat, sendMessage } = useChat()

  useEffect(() => { loadChats() }, [])

  useEffect(() => {
    if (chatId) {
      loadChat(parseInt(chatId))
    }
  }, [chatId])

  const handleNewChat = async () => {
    const chat = await createChat()
    if (chat) navigate(`/chat/${chat.id}`)
  }

  const handleDelete = async (id: number) => {
    await deleteChat(id)
    if (String(id) === chatId) navigate('/chat')
  }

  return (
    <div className="flex h-full">
      {/* Left: Chat history */}
      <div className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all text-sm font-medium"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : (
            <ChatHistory chats={chats} onDelete={handleDelete} />
          )}
        </div>
      </div>

      {/* Right: Active chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat title */}
        {activeChat && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{activeChat.title}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">{activeChat.messages.length} messages</p>
          </div>
        )}

        {/* Messages */}
        {isLoading && chatId ? (
          <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <ChatWindow />
        )}

        {/* Input */}
        {activeChat ? (
          <ChatInput onSend={sendMessage} />
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center text-sm text-gray-400 dark:text-gray-500">
            Select a chat or create a new one to get started.
          </div>
        )}
      </div>
    </div>
  )
}
