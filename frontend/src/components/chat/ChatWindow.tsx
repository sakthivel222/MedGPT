import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { useChatStore } from '../../store/chatStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../../types'

export default function ChatWindow() {
  const { activeChat, isStreaming, streamingContent } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, streamingContent, isStreaming])

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare size={32} className="text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Start a conversation
        </h3>
        <p className="text-sm text-center max-w-sm">
          Ask MedGPT anything about symptoms, medications, medical reports, or general health questions.
        </p>
      </div>
    )
  }

  const messages = activeChat.messages

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.length === 0 && !isStreaming && (
        <div className="text-center text-gray-400 dark:text-gray-500 mt-8">
          <p className="text-sm">This is the beginning of your conversation.</p>
          <p className="text-xs mt-1">Type a medical question below to get started.</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Streaming response */}
      {isStreaming && streamingContent && (
        <div className="flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold">
            M
          </div>
          <div className="max-w-[75%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div className="prose-medical">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamingContent}
              </ReactMarkdown>
            </div>
            <span className="inline-block w-1.5 h-4 bg-primary-500 animate-pulse ml-0.5 align-middle" />
          </div>
        </div>
      )}

      {/* Typing indicator (before content arrives) */}
      {isStreaming && !streamingContent && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}
