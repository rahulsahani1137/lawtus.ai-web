import { NextRequest, NextResponse } from 'next/server'

const ENCORE_API_URL = process.env.ENCORE_API_URL || 'http://127.0.0.1:4000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward request to Encore backend
    const response = await fetch(`${ENCORE_API_URL}/cldi-documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Failed to upload document',
      }))
      return NextResponse.json(
        { message: error.message || 'Upload failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
