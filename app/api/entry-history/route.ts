import { NextResponse } from 'next/server'
import { getEntries, addEntry } from '@/lib/scan-history'

export async function GET() {
  return NextResponse.json({ success: true, entries: getEntries() })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const entry = addEntry(data)
    return NextResponse.json({ success: true, entry })
  } catch (err) {
    console.error('Error saving entry:', err)
    return NextResponse.json({ success: false, message: 'Error saving entry' }, { status: 500 })
  }
}
