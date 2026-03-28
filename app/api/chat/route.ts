import { NextRequest, NextResponse } from 'next/server'

// Upstream API URL
const CIA_API_URL =
  process.env.NEXT_PUBLIC_CIA_API_URL ||
  'https://k2dup2xlcwxqhp7jzpzxww7zha0rdmdq.lambda-url.us-east-1.on.aws/'

// Timeout in milliseconds (server-side)
// Set this in Amplify as CIA_API_TIMEOUT_MS (or another name you prefer)
const CIA_API_TIMEOUT_MS = Number(process.env.CIA_API_TIMEOUT_MS || 250000)

export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CIA_API_TIMEOUT_MS)

  try {
    const body = await req.json()

    const response = await fetch(CIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const responseText = await response.text()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Upstream API failed with status ${response.status}`,
          details: responseText,
        },
        { status: response.status }
      )
    }

    // Try to return JSON, fall back to plain text
    try {
      const json = JSON.parse(responseText)
      return NextResponse.json(json)
    } catch {
      return new NextResponse(responseText, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
  } catch (error: any) {
    const isAbort = error?.name === 'AbortError'
    const message = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        error: isAbort ? 'Upstream API timeout' : 'Proxy request failed',
        details: message,
      },
      { status: isAbort ? 504 : 500 }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
