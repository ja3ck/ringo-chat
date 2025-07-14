import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

interface MessageContent {
  type: 'text' | 'image'
  text?: string
  image?: string // base64 encoded image
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string | MessageContent[]
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    // Process messages to handle multimodal content
    const processedMessages = messages.map((msg: Message) => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content
        }
      } else if (Array.isArray(msg.content)) {
        // Handle multimodal content
        return {
          role: msg.role,
          content: msg.content
        }
      }
      return msg
    })

    const result = await streamText({
      model: openai('gpt-4o'),
      messages: processedMessages,
      maxTokens: 1000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('OpenAI API error:', error)
    return new Response('Failed to get response from OpenAI', { status: 500 })
  }
}