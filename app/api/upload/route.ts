import { NextResponse } from 'next/server'
import { Client } from 'basic-ftp'

async function uploadToFtp(file: File, folder: string): Promise<string> {
  const client = new Client()
  const host = process.env.FTP_HOST
  const user = process.env.FTP_USER
  const password = process.env.FTP_PASSWORD
  const basePath = process.env.FTP_BASE_PATH || ''
  const publicUrl = process.env.FTP_PUBLIC_URL_BASE || ''

  if (!host || !user || !password) {
    throw new Error('Missing FTP credentials')
  }

  const remoteDir = folder ? `${basePath}/${folder}` : basePath
  const fileName = `${Date.now()}_${file.name}`

  await client.access({ host, user, password })
  if (remoteDir) {
    await client.ensureDir(remoteDir)
    await client.cd(remoteDir)
  }
  const data = Buffer.from(await file.arrayBuffer())
  await client.uploadFrom(data, fileName)
  client.close()
  const path = folder ? `${folder}/${fileName}` : fileName
  return `${publicUrl}/${path}`.replace(/\/+/g, '/')
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const folder = (form.get('folder') as string | null) || ''
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    const url = await uploadToFtp(file, folder)
    return NextResponse.json({ success: true, url })
  } catch (err) {
    console.error('Error uploading file via FTP:', err)
    return NextResponse.json(
      { success: false, message: 'Error uploading file' },
      { status: 500 }
    )
  }
}
