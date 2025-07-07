// app/api/upload/route.ts

import { NextResponse } from "next/server";
import { Client as FTPClient } from "basic-ftp";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1) Extraer el archivo y la carpeta (opcional) del FormData
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string) || ""; // p.ej. "wp-content/FotosARC"

  if (!file) {
    return NextResponse.json({ success: false, message: "No se ha proporcionado ningún archivo" }, { status: 400 });
  }

  // 2) Convertir a Buffer y crear un stream
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  // 3) Generar un nombre único para el fichero
  const timestamp = Date.now();
  // Reemplaza espacios por guiones bajos, conserva extensión
  const safeName = file.name.replace(/\s+/g, "_");
  const fileName = `${timestamp}_${safeName}`;

  // 4) Leer credenciales desde variables de entorno
  const host = process.env.FTP_HOST!;
  const user = process.env.FTP_USER!;
  const pass = process.env.FTP_PASS!;
  const limited = process.env.FTP_LIMITED === "true";

  if (!host || !user || !pass) {
    return NextResponse.json(
      { success: false, message: "Credenciales FTP no configuradas" },
      { status: 500 }
    );
  }

  // 5) Conectar por FTP y subir
  const client = new FTPClient();
  try {
    await client.access({ host, user, password: pass, secure: false });

    let remotePath: string;
    if (limited) {
      // En modo limitado, el home directory ya es la carpeta destino
      remotePath = fileName;
    } else {
      // Si usas carpeta, la creamos bajo public_html
      const dir = `public_html/${folder}`.replace(/\/+$/,"");
      await client.ensureDir(dir);
      remotePath = `${dir}/${fileName}`;
    }

    await client.uploadFrom(stream, remotePath);
    await client.close();
  } catch (err: any) {
    console.error("FTP upload failed:", err);
    return NextResponse.json(
      { success: false, message: "Error al subir por FTP" },
      { status: 500 }
    );
  }

  // 6) Construir la URL pública
  // Debe coincidir con tu .env.local: UPLOAD_BASE_URL=https://tudominio.com/public_html/<folder>
  const baseUrl = process.env.UPLOAD_BASE_URL!;
  const publicUrl = [baseUrl, folder, fileName]
    .filter(Boolean)
    .join("/")
    .replace(/(?<!:)\/{2,}/g, "/"); // elimina dobles slashes

  return NextResponse.json({ success: true, url: publicUrl });
}
