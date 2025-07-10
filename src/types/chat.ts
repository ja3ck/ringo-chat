export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null
}

export interface FileUpload {
  id: string
  messageId: string
  filename: string
  filepath: string
  filetype: string
  filesize: number
  createdAt: Date
}