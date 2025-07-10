import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const [settingsRows]: any = await pool.query(
      `SELECT id, price, due_day, late_fee, bank_name, account_holder, clabe, updated_at, updated_by FROM maintenance_settings ORDER BY id DESC LIMIT 1`
    )
    const settings = settingsRows[0] || null
    const [historyRows]: any = await pool.query(
      `SELECT id, price, effective_date, created_by, created_at, notes FROM maintenance_price_history ORDER BY effective_date DESC`
    )
    return NextResponse.json({ success: true, settings, history: historyRows })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      price,
      dueDay,
      lateFee,
      bankName,
      accountHolder,
      clabe,
      updatedBy,
      notes,
    } = body

    if (
      price === undefined &&
      dueDay === undefined &&
      lateFee === undefined &&
      bankName === undefined &&
      accountHolder === undefined &&
      clabe === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "No data provided" },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE maintenance_settings SET price = COALESCE(?, price), due_day = COALESCE(?, due_day), late_fee = COALESCE(?, late_fee), bank_name = COALESCE(?, bank_name), account_holder = COALESCE(?, account_holder), clabe = COALESCE(?, clabe), updated_at = NOW(), updated_by = ? WHERE id = 1`,
      [
        price,
        dueDay,
        lateFee,
        bankName,
        accountHolder,
        clabe,
        updatedBy,
      ]
    )

    if (price !== undefined) {
      await pool.query(
        `INSERT INTO maintenance_price_history (price, effective_date, created_by, created_at, notes) VALUES (?, NOW(), ?, NOW(), ?)`,
        [price, updatedBy, notes || null]
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
