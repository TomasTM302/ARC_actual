import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Obtener todas las áreas comunes con mapeo de campos
export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nombre as name, 
        descripcion as description, 
        capacidad as capacity, 
        horario_apertura, 
        horario_cierre, 
        costo_reservacion, 
        requiere_deposito, 
        monto_deposito, 
        imagen_url, 
        condominio_id, 
        activo
      FROM areas_comunes`
    )
    // Mapear los datos para el frontend
    const areas = Array.isArray(rows) ? rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      capacity: row.capacity,
      deposit: row.monto_deposito,
      operatingHours: `${row.horario_apertura} - ${row.horario_cierre}`,
      maxDuration: row.costo_reservacion,
      imageUrl: row.imagen_url,
      isActive: row.activo === 'Activo',
      activo: row.activo, // Devolver el valor real para el frontend
      type: "common",
    })) : []
    return NextResponse.json({ success: true, areas })
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error al obtener áreas comunes" }, { status: 500 })
  }
}

// Guardar (crear o actualizar) un área común
export async function POST(req: Request) {
  const data = await req.json()
  // Log para depuración
  console.log('Datos recibidos en backend areas-comunes:', data)
  const {
    id,
    nombre,
    descripcion,
    tipo,
    monto_deposito,
    horario_apertura,
    horario_cierre,
    capacidad,
    costo_reservacion,
    activo = 1,
    requiere_deposito = 0,
    condominio_id
  } = data

  try {
    // Determinar valor correcto para ENUM
    let activoEnum = 'Activo';
    if (typeof activo === 'string') {
      activoEnum = activo === 'Inactivo' ? 'Inactivo' : 'Activo';
    } else if (activo === 0 || activo === false) {
      activoEnum = 'Inactivo';
    }

    if (id) {
      // Actualizar área existente
      await pool.execute(
        `UPDATE areas_comunes SET nombre=?, descripcion=?, monto_deposito=?, horario_apertura=?, horario_cierre=?, capacidad=?, costo_reservacion=?, activo=?, requiere_deposito=?, tipo=?, condominio_id=? WHERE id=?`,
        [
          nombre,
          descripcion,
          monto_deposito,
          horario_apertura,
          horario_cierre,
          capacidad,
          costo_reservacion,
          activoEnum,
          requiere_deposito ? 1 : 0,
          tipo,
          condominio_id,
          id
        ]
      )
      return NextResponse.json({ success: true, message: "Área actualizada" })
    } else {
      // Crear nueva área
      const [result] = await pool.execute(
        `INSERT INTO areas_comunes (nombre, descripcion, monto_deposito, horario_apertura, horario_cierre, capacidad, costo_reservacion, activo, requiere_deposito, tipo, condominio_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          descripcion,
          monto_deposito,
          horario_apertura,
          horario_cierre,
          capacidad,
          costo_reservacion,
          activoEnum,
          requiere_deposito ? 1 : 0,
          tipo,
          condominio_id
        ]
      )
      // Obtener el área recién creada para devolverla al frontend
      const [rows] = await pool.execute(`SELECT * FROM areas_comunes WHERE id = LAST_INSERT_ID()`)
      const area = (rows as any[])[0];
      return NextResponse.json({ success: true, message: "Área creada", area })
    }
  } catch (err) {
    console.error('Error al guardar área común:', err);
    let msg = 'Error desconocido';
    if (err && typeof err === 'object' && 'message' in err) {
      msg = (err as any).message;
    } else if (typeof err === 'string') {
      msg = err;
    }
    return NextResponse.json({ success: false, message: `Error al guardar área común: ${msg}` }, { status: 500 })
  }
}
