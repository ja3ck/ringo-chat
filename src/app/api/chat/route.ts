import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    const result = await streamText({
      model: openai('gpt-4o'),
      messages: messages.map((msg: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      maxTokens: 1000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('OpenAI API error:', error)
    return new Response('Failed to get response from OpenAI', { status: 500 })
  }
}