'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useChatStore } from '@/lib/store'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'
import TypingIndicator from '@/components/chat/TypingIndicator'

export default function Home() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [processingMessage, setProcessingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    conversations, 
    currentConversationId, 
    addMessage,
    addConversation,
    updateMessage,
    removeMessage,
    isLoading,
    clearAllConversations
  } = useChatStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages, isTyping])

  const handleSendMessage = async (content: string) => {
    console.log('=== handleSendMessage called ===', content)
    
    if (processingMessage) {
      console.log('Already processing a message, ignoring')
      return
    }
    
    try {
      setProcessingMessage(true)
      setIsTyping(true)
      
      // Create new conversation if none exists
      let conversationId = currentConversationId
      let targetConversation = currentConversation
      
      console.log('Current conversation:', currentConversationId, !!currentConversation)
      
      if (!targetConversation) {
        conversationId = Date.now().toString()
        const newConversation = {
          id: conversationId,
          userId: userId,
          title: content.substring(0, 50) + '...',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        console.log('Creating new conversation:', conversationId)
        addConversation(newConversation)
        targetConversation = newConversation
      }

      // Add user message with unique ID
      const userMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        conversationId: conversationId!,
        role: 'user' as const,
        content,
        createdAt: new Date()
      }
      console.log('Adding user message:', userMessage.id)
      addMessage(userMessage)

      // Get conversation history for context (use the target conversation we have)
      const allMessages = [...targetConversation.messages, userMessage]
      
      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      
      // Add AI response with unique ID
      const aiMessage = {
        id: `assistant-${Date.now()}`,
        conversationId: conversationId!,
        role: 'assistant' as const,
        content: data.message,
        createdAt: new Date()
      }
      addMessage(aiMessage)
      setIsTyping(false)
      setProcessingMessage(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      setProcessingMessage(false)
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: currentConversationId || Date.now().toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly.',
        createdAt: new Date()
      }
      addMessage(errorMessage)
    }
  }

  // For now, allow guest access - in production you'd want proper auth
  const userId = session?.user?.id || 'guest'

  const handleRegenerateMessage = async (messageId: string) => {
    if (!currentConversation || processingMessage) return

    try {
      setProcessingMessage(true)
      setIsTyping(true)

      // Find the message and its position
      const messageIndex = currentConversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) return

      // Get all messages up to (but not including) the message to regenerate
      const messagesUpToRegenerate = currentConversation.messages.slice(0, messageIndex)
      
      // Remove the message we're regenerating
      removeMessage(messageId)

      // Call OpenAI API with conversation history up to that point
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesUpToRegenerate.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate response')
      }

      const data = await response.json()
      
      // Add new AI response
      const newAiMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        conversationId: currentConversation.id,
        role: 'assistant' as const,
        content: data.message,
        createdAt: new Date()
      }
      addMessage(newAiMessage)
      setIsTyping(false)
      setProcessingMessage(false)
    } catch (error) {
      console.error('Error regenerating message:', error)
      setIsTyping(false)
      setProcessingMessage(false)
      
      // Add error message
      const errorMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        conversationId: currentConversation.id,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error while regenerating the response.',
        createdAt: new Date()
      }
      addMessage(errorMessage)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {currentConversation?.messages.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {currentConversation.messages
                .filter((message, index, array) => {
                  // Remove duplicates based on content and timestamp
                  const isDuplicate = array.findIndex(m => 
                    m.content === message.content && 
                    m.role === message.role &&
                    Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000
                  ) !== index
                  if (isDuplicate) {
                    console.log('Filtering out duplicate message:', message.id)
                  }
                  return !isDuplicate
                })
                .map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRegenerate={() => handleRegenerateMessage(message.id)}
                  onCopy={() => {}}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Ringo Chat
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a conversation with AI by typing a message below
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
          isLoading={isLoading || processingMessage}
          placeholder="Type your message..."
        />
      </div>
    </div>
  )
}