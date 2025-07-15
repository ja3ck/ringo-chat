'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
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
  const [uploadError, setUploadError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || uploadedFiles.length > 0) && !isLoading) {
      onSendMessage(message.trim(), uploadedFiles)
      setMessage('')
      setUploadedFiles([])
      setUploadError(null)
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
    setUploadError(null)
    
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`)
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        return data.file as UploadedFile
      } catch (error) {
        console.error('File upload error:', error)
        throw error
      }
    })

    try {
      const uploadedFileResults = await Promise.all(uploadPromises)
      setUploadedFiles(prev => [...prev, ...uploadedFileResults])
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload files')
    }
    
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
      {/* Display upload error */}
      {uploadError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{uploadError}</p>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Display upload progress */}
      {isUploading && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-blue-800">Uploading files...</p>
          </div>
        </div>
      )}
      
      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {uploadedFiles.map((file) => {
            const isImage = file.filetype.startsWith('image/')
            return (
              <div key={file.filepath} className="relative">
                {isImage ? (
                  <div className="relative group">
                    <Image 
                      src={file.filepath} 
                      alt={file.filename}
                      width={64}
                      height={64}
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
                    <button
                      type="button"
                      onClick={() => removeFile(file.filepath)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <XCircleIcon className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-b-lg truncate">
                      {file.filename}
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm">
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
                )}
              </div>
            )
          })}
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
          className={`flex-shrink-0 p-2 rounded-md transition-colors ${
            isUploading 
              ? 'text-blue-500 bg-blue-50' 
              : uploadedFiles.length > 0
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          disabled={isLoading || isUploading}
          title={
            isUploading 
              ? 'Uploading files...' 
              : uploadedFiles.length > 0 
              ? `${uploadedFiles.length} file(s) attached` 
              : 'Attach files'
          }
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          ) : (
            <PaperClipIcon className="h-5 w-5" />
          )}
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