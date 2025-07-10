'use client'

import { useState } from 'react'
import { useChatStore } from '@/lib/store'
import { 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { conversations, currentConversationId, setCurrentConversation } = useChatStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleNewChat = () => {
    setCurrentConversation(null)
    onClose()
  }

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId)
    onClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <button 
                onClick={onClose}
                className="md:hidden p-1 rounded hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full mt-3 flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                      currentConversationId === conversation.id
                        ? 'bg-blue-600'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <ChatBubbleLeftIcon className="h-5 w-5 mt-0.5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {conversation.title || 'New Conversation'}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.messages.length > 0 
                            ? conversation.messages[conversation.messages.length - 1].content.substring(0, 50) + '...'
                            : 'No messages yet'
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(conversation.updatedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}