import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

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
