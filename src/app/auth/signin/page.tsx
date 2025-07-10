'use client'

import { useState } from 'react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGuestAccess = async () => {
    setIsLoading(true)
    // For now, redirect to home page as guest
    // In a real app, you'd implement guest session handling
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Ringo Chat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your AI conversational companion
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <button
              onClick={handleGuestAccess}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Continue as Guest'}
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Guest access allows you to try the chat interface without signing in.
                Your conversations will not be saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}