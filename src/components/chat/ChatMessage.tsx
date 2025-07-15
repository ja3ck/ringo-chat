'use client'

import { Message } from '@/types/chat'
import { format } from 'date-fns'
import Image from 'next/image'
import { 
  UserCircleIcon, 
  ComputerDesktopIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  DocumentIcon,
  PhotoIcon
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
    const textContent = typeof message.content === 'string' ? message.content : ''
    navigator.clipboard.writeText(textContent)
    onCopy?.()
  }

  // Extract file attachments from message content
  const extractFiles = (content: string | unknown) => {
    // If content is not a string (e.g., multimodal array), just return the content as is
    if (typeof content !== 'string') {
      return { files: [], messageContent: '', hasImages: false }
    }
    
    const attachmentMatch = content.match(/Attached files: (.+)/)
    if (attachmentMatch) {
      const filesString = attachmentMatch[1]
      const fileMatches = filesString.match(/\[([^\]]+)\]/g) || []
      const files = fileMatches.map(match => {
        const fileData = match.slice(1, -1) // Remove brackets
        const parts = fileData.split('|')
        
        // Handle both old format (just filename) and new format (filename|filepath|filetype)
        if (parts.length >= 3) {
          return {
            filename: parts[0],
            filepath: parts[1],
            filetype: parts[2]
          }
        } else {
          // Fallback for old format
          return {
            filename: parts[0],
            filepath: '', // No path available
            filetype: ''
          }
        }
      })
      
      const messageWithoutFiles = content.replace(/\n\nAttached files: .+/, '')
      const hasImages = files.some(file => file.filetype.startsWith('image/'))
      return { files, messageContent: messageWithoutFiles, hasImages }
    }
    return { files: [], messageContent: content, hasImages: false }
  }

  const { files, messageContent } = extractFiles(message.content)

  const getFileIcon = (filetype: string) => {
    if (filetype.startsWith('image/')) {
      return <PhotoIcon className="h-5 w-5 text-gray-600" />
    }
    return <DocumentIcon className="h-5 w-5 text-gray-600" />
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
            <p className="text-gray-800 whitespace-pre-wrap">{messageContent || (typeof message.content === 'string' ? message.content : '')}</p>
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
                        style={tomorrow}
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
                {typeof message.content === 'string' ? message.content : ''}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* File Attachments */}
        {files.length > 0 && (
          <div className="mt-3">
            {/* Images */}
            {files.filter(file => file.filetype.startsWith('image/')).map((file, index) => (
              <div key={`img-${index}`} className="mb-3">
                <div className="relative max-w-sm">
                  <Image 
                    src={file.filepath} 
                    alt={file.filename}
                    width={400}
                    height={256}
                    className="max-w-sm max-h-64 object-contain rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => window.open(file.filepath, '_blank')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{file.filename}</p>
              </div>
            ))}
            
            {/* Non-image files */}
            {files.filter(file => !file.filetype.startsWith('image/')).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.filter(file => !file.filetype.startsWith('image/')).map((file, index) => (
                  <div key={`file-${index}`} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                    {getFileIcon(file.filetype)}
                    <span className="text-gray-700">{file.filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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