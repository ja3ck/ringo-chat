import { create } from 'zustand'
import { ChatState, Conversation, Message } from '@/types/chat'

interface ChatStore extends ChatState {
  addConversation: (conversation: Conversation) => void
  setCurrentConversation: (conversationId: string | null) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, content: string) => void
  removeMessage: (messageId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearAllConversations: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null,

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversationId: conversation.id,
    })),

  setCurrentConversation: (conversationId) =>
    set({ currentConversationId: conversationId }),

  addMessage: (message) =>
    set((state) => {
      console.log('Adding message:', message.id, message.content.substring(0, 30))
      
      // Check if message already exists to prevent duplicates
      const conversation = state.conversations.find(conv => conv.id === message.conversationId)
      if (conversation && conversation.messages.some(msg => msg.id === message.id)) {
        console.log('Message already exists, skipping:', message.id)
        return state
      }
      
      return {
        conversations: state.conversations.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        ),
      }
    }),

  updateMessage: (messageId, content) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg.id === messageId ? { ...msg, content } : msg
        ),
      })),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        messages: conv.messages.filter((msg) => msg.id !== messageId),
      })),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearAllConversations: () => set({ conversations: [], currentConversationId: null }),
}))