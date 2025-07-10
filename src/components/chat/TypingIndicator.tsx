'use client'

import { ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function TypingIndicator() {
  return (
    <div className="flex space-x-4 p-4 bg-white">
      <div className="flex-shrink-0">
        <ComputerDesktopIcon className="h-8 w-8 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Assistant</h3>
          <span className="text-xs text-gray-500">typing...</span>
        </div>
        <div className="flex items-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}