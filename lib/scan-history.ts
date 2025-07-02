export interface ScanHistoryEntry {
  id?: number
  tipo?: string
  vigilante_id?: number | string
  condominio_id?: number | string
  fecha_entrada?: string
  fecha_salida?: string | null
  placa_vehiculo?: string | null
  scanned_at?: string
  qr_data?: string
  ine?: string | null
}
