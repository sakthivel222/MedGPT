import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useChatStore } from '../store/chatStore'
import { chatService } from '../services/chat'

export function useChat() {
  const store = useChatStore()

  const loadChats = useCallback(async () => {
    store.setLoading(true)
    try {
      const chats = await chatService.getChats()
      store.setChats(chats)
    } catch {
      toast.error('Failed to load chats')
    } finally {
      store.setLoading(false)
    }
  }, [])

  const createChat = useCallback(async (title?: string) => {
    try {
      const chat = await chatService.createChat(title)
      store.addChat({
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        is_archived: chat.is_archived,
        message_count: 0,
      })
      store.setActiveChat(chat)
      return chat
    } catch {
      toast.error('Failed to create chat')
    }
  }, [])

  const loadChat = useCallback(async (chatId: number) => {
    store.setLoading(true)
    try {
      const chat = await chatService.getChat(chatId)
      store.setActiveChat(chat)
    } catch {
      toast.error('Failed to load chat')
    } finally {
      store.setLoading(false)
    }
  }, [])

  const deleteChat = useCallback(async (chatId: number) => {
    try {
      await chatService.deleteChat(chatId)
      store.removeChat(chatId)
      if (store.activeChat?.id === chatId) {
        store.setActiveChat(null)
      }
      toast.success('Chat deleted')
    } catch {
      toast.error('Failed to delete chat')
    }
  }, [store.activeChat])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!store.activeChat) return
      const chatId = store.activeChat.id

      // Optimistic user message
      const userMsg = {
        id: Date.now(),
        chat_id: chatId,
        role: 'user' as const,
        content,
        tokens_used: 0,
        model_used: null,
        created_at: new Date().toISOString(),
      }
      store.addMessage(userMsg)
      store.setStreaming(true)

      try {
        let fullContent = ''
        await chatService.sendMessage(
          chatId,
          content,
          store.useRag,
          store.selectedDocumentId || undefined,
          (chunk) => {
            fullContent += chunk
            store.appendStreamChunk(chunk)
          },
          () => {
            store.finalizeStream({
              id: Date.now() + 1,
              chat_id: chatId,
              role: 'assistant',
              content: fullContent,
              tokens_used: 0,
              model_used: null,
              created_at: new Date().toISOString(),
            })
            store.updateChatTitle(chatId, content.split(' ').slice(0, 6).join(' '))
          },
        )
      } catch (err: any) {
        store.setStreaming(false)
        toast.error('Failed to send message. Is Ollama running?')
      }
    },
    [store],
  )

  return {
    ...store,
    loadChats,
    createChat,
    loadChat,
    deleteChat,
    sendMessage,
  }
}
