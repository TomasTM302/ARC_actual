export interface ScanHistoryEntry {
  id: string;
  ine?: string | null;
  tipo?: string;
  vigilante_id?: string | number;
  condominio_id?: string | number;
  placa_vehiculo?: string | null;
  scanned_at?: string;
  fecha_entrada?: string;
}

const entries: ScanHistoryEntry[] = [];

export function getEntries(): ScanHistoryEntry[] {
  return entries;
}

export function addEntry(entry: Omit<ScanHistoryEntry, 'id'>): ScanHistoryEntry {
  const newEntry: ScanHistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    ...entry,
  };
  entries.unshift(newEntry);
  return newEntry;
}
