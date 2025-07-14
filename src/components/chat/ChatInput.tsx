'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface UploadedFile {
  id?: string
  filename: string
  filepath: string
  filetype: string
  filesize: number
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: UploadedFile[]) => void
  isLoading?: boolean
  placeholder?: string
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || uploadedFiles.length > 0) && !isLoading) {
      onSendMessage(message.trim(), uploadedFiles)
      setMessage('')
      setUploadedFiles([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.file as UploadedFile
      } catch (error) {
        console.error('File upload error:', error)
        return null
      }
    })

    const uploadedFileResults = await Promise.all(uploadPromises)
    const successfulUploads = uploadedFileResults.filter((file): file is UploadedFile => file !== null)
    
    setUploadedFiles(prev => [...prev, ...successfulUploads])
    setIsUploading(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (filepath: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filepath !== filepath))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <div key={file.filepath} className="inline-flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-700">{file.filename}</span>
              <span className="text-gray-500 ml-2">({formatFileSize(file.filesize)})</span>
              <button
                type="button"
                onClick={() => removeFile(file.filepath)}
                className="ml-2 text-gray-400 hover:text-red-600"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          multiple
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
          className="hidden"
        />
        
        {/* File Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          disabled={isLoading || isUploading}
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
            disabled={(!message.trim() && uploadedFiles.length === 0) || isLoading || isUploading}
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