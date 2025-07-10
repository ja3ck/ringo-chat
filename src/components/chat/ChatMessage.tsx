'use client'

import { Message } from '@/types/chat'
import { format } from 'date-fns'
import { 
  UserCircleIcon, 
  ComputerDesktopIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ChatMessageProps {
  message: Message
  onRegenerate?: () => void
  onCopy?: () => void
}

export default function ChatMessage({ message, onRegenerate, onCopy }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    onCopy?.()
  }

  return (
    <div className={`flex space-x-4 p-4 ${isUser ? 'bg-blue-50' : 'bg-white'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <UserCircleIcon className="h-8 w-8 text-blue-600" />
        ) : (
          <ComputerDesktopIcon className="h-8 w-8 text-green-600" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : 'Assistant'}
          </h3>
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
        </div>

        {/* Message Text */}
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-gray-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return isInline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isUser && (
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Regenerate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}