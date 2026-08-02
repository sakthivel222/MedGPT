import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, Zap } from 'lucide-react'
import { classNames } from '../../utils/helpers'
import { useChatStore } from '../../store/chatStore'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isStreaming, useRag, setUseRag } = useChatStore()

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming || disabled) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
    }
  }

  const suggestions = [
    'What are the symptoms of diabetes?',
    'Explain my blood test results',
    'What medications interact with aspirin?',
    'How is hypertension treated?',
  ]

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* Suggestions (shown when empty) */}
      {!input && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* RAG toggle */}
        <button
          onClick={() => setUseRag(!useRag)}
          title={useRag ? 'RAG enabled — searching your documents' : 'Enable document search (RAG)'}
          className={classNames(
            'p-2 rounded-lg transition-all duration-200 shrink-0',
            useRag
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          )}
        >
          <Zap size={18} />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); handleInput() }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'MedGPT is thinking...' : 'Ask a medical question... (Enter to send, Shift+Enter for newline)'}
            disabled={isStreaming || disabled}
            rows={1}
            className={classNames(
              'w-full resize-none input-field pr-4 py-3 text-sm leading-relaxed',
              'max-h-[200px] overflow-y-auto',
              (isStreaming || disabled) ? 'opacity-50 cursor-not-allowed' : '',
            )}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || disabled}
          className={classNames(
            'p-3 rounded-xl transition-all duration-200 shrink-0',
            input.trim() && !isStreaming && !disabled
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
          )}
        >
          <Send size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
        MedGPT provides health information, not medical advice. Always consult a doctor.
      </p>
    </div>
  )
}
