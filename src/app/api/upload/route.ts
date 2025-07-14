import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const messageId = formData.get('messageId') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uniqueId}${fileExtension}`
    const filepath = path.join(uploadsDir, uniqueFilename)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save file metadata to database if messageId is provided
    let fileRecord = null
    if (messageId) {
      fileRecord = await prisma.file.create({
        data: {
          messageId,
          filename: file.name,
          filepath: `/uploads/${uniqueFilename}`,
          filetype: file.type,
          filesize: file.size,
        }
      })
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord?.id,
        filename: file.name,
        filepath: `/uploads/${uniqueFilename}`,
        filetype: file.type,
        filesize: file.size,
      }
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}