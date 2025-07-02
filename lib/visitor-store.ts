import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Visitor {
  id: string
  name: string
  phone: string
  visitDate: string
  entryTime: string
  destination: string
  companions: string
  photoUrl?: string
  qrCode?: string
  createdAt: string
  status: "pending" | "approved" | "denied" | "completed"
}

interface VisitorState {
  visitors: Visitor[]
  addVisitor: (visitor: Omit<Visitor, "id" | "createdAt" | "status">) => string
  getVisitorByQrData: (qrData: string) => Visitor | undefined
  updateVisitorStatus: (id: string, status: Visitor["status"]) => void
  getVisitors: () => Visitor[]
}

// Mock visitors for demonstration
const initialVisitors: Visitor[] = [
  {
    id: "visitor-1",
    name: "Juan Pérez",
    phone: "5551234567",
    visitDate: "2023-08-15",
    entryTime: "14:00",
    destination: "Casa 42",
    companions: "2",
    photoUrl: "/placeholder.svg?height=200&width=200",
    qrCode:
      "NOMBRE: Juan Pérez\nTELÉFONO: 5551234567\nFECHA: 2023-08-15\nHORA: 14:00\nDIRECCIÓN: Casa 42\nACOMPAÑANTES: 2",
    createdAt: new Date().toISOString(),
    status: "pending",
  },
  {
    id: "visitor-2",
    name: "María González",
    phone: "5559876543",
    visitDate: "2023-08-16",
    entryTime: "10:30",
    destination: "Casa 15",
    companions: "0",
    createdAt: new Date().toISOString(),
    status: "approved",
  },
]

export const useVisitorStore = create<VisitorState>()(
  persist(
    (set, get) => ({
      visitors: initialVisitors,

      addVisitor: (visitorData) => {
        const id = `visitor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

        // Generate QR data
        const companions = visitorData.companions ? `\nACOMPAÑANTES: ${visitorData.companions}` : ""
        const qrCode = `NOMBRE: ${visitorData.name}\nTELÉFONO: ${visitorData.phone}\nFECHA: ${visitorData.visitDate}\nHORA: ${visitorData.entryTime}\nDIRECCIÓN: ${visitorData.destination}${companions}`

        const newVisitor: Visitor = {
          ...visitorData,
          id,
          qrCode,
          createdAt: new Date().toISOString(),
          status: "pending",
        }

        set((state) => ({
          visitors: [...state.visitors, newVisitor],
        }))

        return id
      },

      getVisitorByQrData: (qrData) => {
        return get().visitors.find((visitor) => visitor.qrCode === qrData)
      },

      updateVisitorStatus: (id, status) => {
        set((state) => ({
          visitors: state.visitors.map((visitor) => (visitor.id === id ? { ...visitor, status } : visitor)),
        }))
      },

      getVisitors: () => {
        return get().visitors
      },
    }),
    {
      name: "arcos-visitor-storage",
    },
  ),
)
