import api from './api'
import type { Chat, ChatList, Message } from '../types'

export const chatService = {
  async getChats(): Promise<ChatList[]> {
    const response = await api.get<ChatList[]>('/chat/')
    return response.data
  },

  async createChat(title?: string): Promise<Chat> {
    const response = await api.post<Chat>('/chat/', { title: title || 'New Chat' })
    return response.data
  },

  async getChat(chatId: number): Promise<Chat> {
    const response = await api.get<Chat>(`/chat/${chatId}`)
    return response.data
  },

  async updateChat(chatId: number, data: { title?: string; is_archived?: boolean }): Promise<Chat> {
    const response = await api.patch<Chat>(`/chat/${chatId}`, data)
    return response.data
  },

  async deleteChat(chatId: number): Promise<void> {
    await api.delete(`/chat/${chatId}`)
  },

  async clearMessages(chatId: number): Promise<void> {
    await api.delete(`/chat/${chatId}/messages`)
  },

  // Returns an EventSource-like reader for streaming
  async sendMessage(
    chatId: number,
    content: string,
    useRag: boolean = false,
    documentId?: number,
    onChunk?: (chunk: string) => void,
    onDone?: () => void,
  ): Promise<void> {
    const token = localStorage.getItem('access_token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

    const response = await fetch(`${API_BASE}/api/chat/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, use_rag: useRag, document_id: documentId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) return

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              onDone?.()
            } else if (data.content) {
              onChunk?.(data.content)
            }
          } catch {}
        }
      }
    }
  },
}

export const documentService = {
  async getDocuments() {
    const response = await api.get('/upload/')
    return response.data
  },

  async uploadPDF(file: File, onProgress?: (p: number) => void) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return response.data
  },

  async deleteDocument(id: number) {
    await api.delete(`/upload/${id}`)
  },

  async searchDocument(query: string, documentId?: number, topK: number = 5) {
    const response = await api.post('/upload/search', {
      query, document_id: documentId, top_k: topK,
    })
    return response.data
  },
}

export const medicalService = {
  async checkSymptoms(data: {
    symptoms: string[]
    age?: number
    gender?: string
    duration?: string
    additional_info?: string
  }) {
    const response = await api.post('/medical/symptom-checker', data)
    return response.data
  },

  async checkDrugInteractions(drugs: string[]) {
    const response = await api.post('/medical/drug-interaction', { drugs })
    return response.data
  },

  async calculateBMI(data: { weight_kg: number; height_cm: number; age?: number; gender?: string }) {
    const response = await api.post('/medical/bmi-calculator', data)
    return response.data
  },

  async analyzeReport(report_text: string, report_type: string) {
    const response = await api.post('/medical/report-analyzer', { report_text, report_type })
    return response.data
  },

  async getMedicineInfo(medicine_name: string, question?: string) {
    const response = await api.post('/medical/medicine-info', { medicine_name, question })
    return response.data
  },

  async getDiseaseInfo(disease_name: string) {
    const response = await api.post('/medical/disease-info', { disease_name })
    return response.data
  },
}

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats')
    return response.data
  },

  async getUsers() {
    const response = await api.get('/admin/users')
    return response.data
  },

  async updateUserRole(userId: number, role: string) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  },

  async updateUserStatus(userId: number, is_active: boolean) {
    const response = await api.patch(`/admin/users/${userId}/status`, { is_active })
    return response.data
  },

  async deleteUser(userId: number) {
    await api.delete(`/admin/users/${userId}`)
  },
}
