import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SyntaxHighlighterProps } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { formatFullDate } from '../../utils/helpers'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../utils/helpers'

interface MessageBubbleProps {
  message: Message
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  )
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
        }`}
      >
        {isUser ? (user ? getInitials(user.full_name) : 'U') : 'M'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] group ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-medical">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isBlock = !props.inline
                    return isBlock && match ? (
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <CopyButton text={String(children)} />
                        </div>
                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatFullDate(message.created_at)}
        </span>
      </div>
    </div>
  )
}
