import { create } from 'zustand'
import type { Chat, ChatList, Message } from '../types'

interface ChatState {
  chats: ChatList[]
  activeChat: Chat | null
  isLoading: boolean
  isStreaming: boolean
  streamingContent: string
  selectedDocumentId: number | null
  useRag: boolean

  setChats: (chats: ChatList[]) => void
  addChat: (chat: ChatList) => void
  removeChat: (chatId: number) => void
  updateChatTitle: (chatId: number, title: string) => void
  setActiveChat: (chat: Chat | null) => void
  addMessage: (message: Message) => void
  setStreaming: (streaming: boolean) => void
  appendStreamChunk: (chunk: string) => void
  finalizeStream: (finalMessage: Message) => void
  setLoading: (loading: boolean) => void
  setSelectedDocument: (id: number | null) => void
  setUseRag: (use: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  selectedDocumentId: null,
  useRag: false,

  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((s) => ({ chats: [chat, ...s.chats] })),
  removeChat: (chatId) => set((s) => ({ chats: s.chats.filter((c) => c.id !== chatId) })),
  updateChatTitle: (chatId, title) =>
    set((s) => ({
      chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
    })),

  setActiveChat: (chat) => set({ activeChat: chat }),

  addMessage: (message) =>
    set((s) => ({
      activeChat: s.activeChat
        ? { ...s.activeChat, messages: [...s.activeChat.messages, message] }
        : null,
    })),

  setStreaming: (isStreaming) => set({ isStreaming, streamingContent: isStreaming ? '' : get().streamingContent }),
  appendStreamChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),

  finalizeStream: (finalMessage) =>
    set((s) => ({
      isStreaming: false,
      streamingContent: '',
      activeChat: s.activeChat
        ? { ...s.activeChat, messages: [...s.activeChat.messages, finalMessage] }
        : null,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setSelectedDocument: (selectedDocumentId) => set({ selectedDocumentId }),
  setUseRag: (useRag) => set({ useRag }),
}))
