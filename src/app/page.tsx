'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useChat } from 'ai/react'
import { useChatStore } from '@/lib/store'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import TypingIndicator from '@/components/chat/TypingIndicator'

export default function Home() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    conversations, 
    currentConversationId, 
    addConversation,
    addMessage,
    isLoading,
    clearAllConversations
  } = useChatStore()

  const { messages, append, isLoading: isChatLoading, setMessages, error } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // Save AI response to store using current conversation ID
      const currentId = useChatStore.getState().currentConversationId
      if (currentId) {
        addMessageToStoreWithId(currentId, 'assistant', message.content)
      }
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isChatLoading])

  // Add individual messages to store with specific conversation ID
  const addMessageToStoreWithId = (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const message = {
      id: `${role}-${Date.now()}-${Math.random()}`,
      conversationId: conversationId,
      role,
      content,
      createdAt: new Date()
    }
    
    addMessage(message)
  }


  
  const handleSendMessage = async (content: string, files?: Array<{filename: string, filepath: string, filetype: string, filesize: number}>) => {
    let conversationId = currentConversationId
    
    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = Date.now().toString()
      const newConversation = {
        id: conversationId,
        userId: userId,
        title: content.substring(0, 50) + '...',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      addConversation(newConversation)
      
      // Set the current conversation ID
      const { setCurrentConversation } = useChatStore.getState()
      setCurrentConversation(conversationId)
    }

    // Check if there are image files
    const imageFiles = files?.filter(f => f.filetype.startsWith('image/')) || []
    
    if (imageFiles.length > 0) {
      // Create multimodal content for images
      const messageContent: any[] = []
      
      // Add text content if present
      if (content.trim()) {
        messageContent.push({
          type: 'text',
          text: content
        })
      }
      
      // Add images
      for (const imageFile of imageFiles) {
        try {
          // Fetch the image and convert to base64
          const response = await fetch(imageFile.filepath)
          const blob = await response.blob()
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64String = reader.result as string
              resolve(base64String.split(',')[1]) // Remove data:image/...;base64, prefix
            }
            reader.readAsDataURL(blob)
          })
          
          messageContent.push({
            type: 'image',
            image: `data:${imageFile.filetype};base64,${base64}`
          })
        } catch (error) {
          console.error('Error processing image:', error)
        }
      }
      
      // Add non-image files as text references
      const nonImageFiles = files?.filter(f => !f.filetype.startsWith('image/')) || []
      if (nonImageFiles.length > 0) {
        const filesList = nonImageFiles.map(f => `[${f.filename}]`).join(', ')
        messageContent.push({
          type: 'text',
          text: `Attached files: ${filesList}`
        })
      }
      
      // Save display message to store
      const displayMessage = content + (files && files.length > 0 ? `\n\nAttached files: ${files.map(f => `[${f.filename}]`).join(', ')}` : '')
      addMessageToStoreWithId(conversationId, 'user', displayMessage)
      
      // Send multimodal message
      await append({
        role: 'user',
        content: messageContent
      })
    } else {
      // Regular text message with file references
      let messageContent = content
      if (files && files.length > 0) {
        const filesList = files.map(f => `[${f.filename}]`).join(', ')
        messageContent = content ? `${content}\n\nAttached files: ${filesList}` : `Attached files: ${filesList}`
      }

      // Save user message to store first
      addMessageToStoreWithId(conversationId, 'user', messageContent)

      // Send text message
      await append({
        role: 'user',
        content: messageContent
      })
    }
  }

  // For now, allow guest access - in production you'd want proper auth
  const userId = session?.user?.id || 'guest'

  const handleRegenerateMessage = async (messageId: string) => {
    if (isChatLoading) return

    // Find the message and its position
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1) return

    // Get all messages up to (but not including) the message to regenerate
    const messagesUpToRegenerate = messages.slice(0, messageIndex)
    
    // Set messages to only include messages up to the point we want to regenerate
    setMessages(messagesUpToRegenerate)

    // Trigger regeneration by appending the last user message
    const lastUserMessage = messagesUpToRegenerate.findLast(msg => msg.role === 'user')
    if (lastUserMessage) {
      await append({
        role: 'user',
        content: lastUserMessage.content
      })
    }
  }

  const handleNewChat = () => {
    // Clear the current conversation in the store
    const { setCurrentConversation } = useChatStore.getState()
    setCurrentConversation(null)
    
    // Clear messages in useChat
    setMessages([])
  }

  const handleSelectConversation = (conversationId: string) => {
    // Don't reload if it's already the current conversation
    if (currentConversationId === conversationId) {
      return
    }
    
    // Set the current conversation in the store
    const { setCurrentConversation } = useChatStore.getState()
    setCurrentConversation(conversationId)
    
    // Find the conversation and load its messages
    const conversation = conversations.find(c => c.id === conversationId)
    
    if (conversation && conversation.messages && conversation.messages.length > 0) {
      const chatMessages = conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content
      }))
      setMessages(chatMessages)
    } else {
      setMessages([])
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    conversationId: currentConversationId || '',
                    role: message.role as 'user' | 'assistant',
                    content: message.content,
                    createdAt: new Date()
                  }}
                  onRegenerate={() => handleRegenerateMessage(message.id)}
                  onCopy={() => {}}
                />
              ))}
              {isChatLoading && <TypingIndicator />}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md mx-4 my-2">
                  <p className="text-red-800">Error: {error.message}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ringo Chat에 오신 것을 환영합니다
                </h2>
                <p className="text-gray-600 mb-6">
                  아래에 메시지를 입력하여 AI와 대화를 시작하세요
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button
                    onClick={() => handleSendMessage("Hello! How can you help me today?")}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">Get started</div>
                    <div className="text-sm text-gray-500">Hello! How can you help me today?</div>
                  </button>
                  <button
                    onClick={() => handleSendMessage("What can you do?")}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-left"
                  >
                    <div className="font-medium text-gray-900">Explore capabilities</div>
                    <div className="text-sm text-gray-500">What can you do?</div>
                  </button>
                  <button
                    onClick={clearAllConversations}
                    className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 text-left"
                  >
                    <div className="font-medium text-red-900">Clear All (Debug)</div>
                    <div className="text-sm text-red-500">Clear all conversations</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isChatLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  )
}