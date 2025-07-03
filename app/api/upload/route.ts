import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'
import { Client } from 'basic-ftp'

async function uploadToFtp(file: File, folder: string): Promise<string> {
  const client = new Client()
  const {
    FTP_HOST,
    FTP_USER,
    FTP_PASSWORD,
    FTP_BASE_PATH = '',
    FTP_PUBLIC_URL_BASE = '',
  } = process.env

  if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
    throw new Error('Missing FTP credentials')
  }

  const remoteDir = folder ? `${FTP_BASE_PATH}/${folder}` : FTP_BASE_PATH
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD })
  if (remoteDir) {
    await client.ensureDir(remoteDir)
    await client.cd(remoteDir)
  }
  const data = Buffer.from(await file.arrayBuffer())
  await client.uploadFrom(data, fileName)
  client.close()
  const path = folder ? `${folder}/${fileName}` : fileName
  return `${FTP_PUBLIC_URL_BASE.replace(/\/$/, '')}/${path}`.replace(/\/+/g, '/')
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

  // Try FTP upload first if credentials are present
  if (process.env.FTP_HOST && process.env.FTP_USER && process.env.FTP_PASSWORD) {
    try {
      const url = await uploadToFtp(file, folder)
      return NextResponse.json({ success: true, url })
    } catch (err) {
      console.error('FTP upload failed:', err)
    }
  }

  const endpoint = process.env.HOSTINGER_ENDPOINT
  const bucket = process.env.HOSTINGER_BUCKET
  const accessKey = process.env.HOSTINGER_ACCESS_KEY
  const secretKey = process.env.HOSTINGER_SECRET_KEY

  if (endpoint && bucket && accessKey && secretKey) {
    try {
      const mod = await (Function('return import')()('@aws-sdk/client-s3'))
      const { S3Client, PutObjectCommand } = mod as any
      const client = new S3Client({
        region: 'us-east-1',
        endpoint,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      })
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${folder}/${fileName}`,
          Body: buffer,
          ContentType: file.type ?? 'application/octet-stream',
        }),
      )
      const url = `${endpoint.replace(/\/$/, '')}/${bucket}/${folder}/${fileName}`
      return NextResponse.json({ success: true, url })
    } catch (err) {
      console.error('S3 upload failed or library missing:', err)
    }
  }

  const dir = join(process.cwd(), 'public', folder)
  await fs.mkdir(dir, { recursive: true })
  const filePath = join(dir, fileName)
  await fs.writeFile(filePath, buffer)
  const url = `/${folder}/${fileName}`
  return NextResponse.json({ success: true, url })
}
