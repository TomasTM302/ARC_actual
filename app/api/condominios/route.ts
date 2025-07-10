import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT id, nombre as name FROM condominios")
    return NextResponse.json({ success: true, condominiums: rows })
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error al obtener condominios" }, { status: 500 })
  }
}
