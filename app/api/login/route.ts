import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { appRoleFromDbRole } from '@/lib/roles'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 })
    }
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.foto_url, u.password_hash, u.rol_id, r.nombre AS rol_nombre, u.condominio_id, u.fecha_registro
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.email = ? LIMIT 1`,
      [email],
    ) as any
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 })
    }
    const user = (rows as any[])[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 })
    }
    const result = {
      id: String(user.id),
      firstName: user.nombre,
      lastName: user.apellido,
      email: user.email,
      phone: user.telefono ?? '',
      house: '',
      role: appRoleFromDbRole(user.rol_nombre ?? 'resident'),
      createdAt: user.fecha_registro,
      photoUrl: user.foto_url ?? '',
      condominiumId: user.condominio_id ?? null,
    }
    return NextResponse.json({ success: true, user: result })
  } catch (err) {
    console.error('Login API error:', err)
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 })
  }
}
