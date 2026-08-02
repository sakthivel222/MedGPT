export type UserRole = 'user' | 'admin' | 'doctor'

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  role: UserRole
  is_active: boolean
  is_verified: boolean
  avatar_url?: string | null
  created_at: string
  last_login?: string | null
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface Message {
  id: number
  chat_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number
  model_used?: string | null
  created_at: string
}

export interface Chat {
  id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
  is_archived: boolean
  messages: Message[]
}

export interface ChatList {
  id: number
  title: string
  created_at: string
  updated_at: string
  is_archived: boolean
  message_count: number
}

export interface Document {
  id: number
  user_id: number
  filename: string
  original_filename: string
  file_size: number
  num_pages: number
  num_chunks: number
  is_processed: boolean
  processing_error?: string | null
  created_at: string
}

export interface ApiError {
  detail: string
}

export interface Stats {
  users: { total: number; active: number; inactive: number }
  chats: { total: number }
  messages: { total: number }
  documents: { total: number; processed: number }
}
