import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ScanHistoryEntry } from '@/lib/scan-history'

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT id, tipo, vigilante_id, condominio_id, fecha_entrada, fecha_salida, placa_vehiculo, scanned_at, qr_data, ine
       FROM historial_entradas
       ORDER BY fecha_entrada DESC
       LIMIT 100`
    )
    return NextResponse.json({ success: true, entries: rows })
  } catch (err) {
    console.error('Error fetching entries:', err)
    return NextResponse.json(
      { success: false, message: 'Error fetching entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Partial<ScanHistoryEntry> & {
      scanned_at?: string
    }

    const [result] = await pool.execute(
      `INSERT INTO historial_entradas (tipo, vigilante_id, condominio_id, fecha_entrada, scanned_at, qr_data, ine, placa_vehiculo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.tipo ?? 'invitado',
        data.vigilante_id,
        data.condominio_id,
        data.fecha_entrada ?? new Date(),
        new Date(),
        data.scanned_at ?? '',
        data.ine ?? null,
        data.placa_vehiculo ?? null,
      ]
    )

    const insertedId = (result as any).insertId
    return NextResponse.json({ success: true, id: insertedId })
  } catch (err) {
    console.error('Error saving entry:', err)
    return NextResponse.json(
      { success: false, message: 'Error saving entry' },
      { status: 500 }
    )
  }
}
