"use client"

import { useEffect, useState } from "react"
import { ScanHistoryEntry } from "@/lib/scan-history"

export default function EntryHistoryTable() {
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([])

  useEffect(() => {
    fetch('/api/entry-history')
      .then(res => res.json())
      .then(data => setEntries(data.entries as ScanHistoryEntry[]))
      .catch(() => {})
  }, [])

  if (entries.length === 0) {
    return (
      <div className="mt-8 text-sm text-gray-500">No hay registros de entrada.</div>
    )
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-left">Datos</th>
            <th className="px-4 py-2 text-left">Placa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-2">
                {e.fecha_entrada ? new Date(e.fecha_entrada).toLocaleString() : ''}
              </td>
              <td className="px-4 py-2">{e.scanned_at}</td>
              <td className="px-4 py-2">{e.placa_vehiculo || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
