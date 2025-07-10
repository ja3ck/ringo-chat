'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea and manage scroll
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight + 'px'
      
      // Only show scroll bar when content exceeds maxHeight
      if (scrollHeight > 120) {
        textareaRef.current.style.overflowY = 'auto'
      } else {
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }, [message])

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        {/* File Upload Button */}
        <button
          type="button"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ maxHeight: '120px', overflowY: 'hidden' }}
            disabled={isLoading}
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}