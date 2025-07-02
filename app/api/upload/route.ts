import { NextResponse } from 'next/server'

export async function POST() {
  // Mock upload - in real app files would be persisted
  return NextResponse.json({ success: true, url: '/placeholder.svg' })
}
