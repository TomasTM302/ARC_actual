import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export interface Fine {
  id: string
  userId: string
  userName: string
  userHouse: string
  reason: string
  amount: number
  status: "pending" | "paid" | "cancelled" | "overdue"
  createdAt: string
  dueDate: string
  lateFee: number
  isOverdue?: boolean
  currentAmount?: number
  paidAt?: string
  createdBy: string
  paymentId?: string // ID del pago que cubrió esta multa
}

interface FinesState {
  fines: Fine[]
  addFine: (fine: Omit<Fine, "id" | "createdAt" | "isOverdue" | "currentAmount">) => string
  updateFine: (id: string, updates: Partial<Fine>) => void
  deleteFine: (id: string) => void
  getFinesByUser: (userId: string) => Fine[]
  getPendingFinesByUser: (userId: string) => Fine[]
  markFineAsPaid: (fineId: string, paymentId: string) => void
  updateFinesStatus: () => void
}

export const useFinesStore = create<FinesState>()(
  persist(
    (set, get) => ({
      fines: [
        // Datos de ejemplo
        {
          id: "fine-1",
          userId: "user-1",
          userName: "Juan Pérez",
          userHouse: "Casa 25",
          reason: "Estacionamiento en área prohibida",
          amount: 500,
          status: "pending",
          createdAt: "2023-06-15T10:30:00Z",
          dueDate: "2023-07-15",
          lateFee: 100,
          createdBy: "admin-1",
        },
        {
          id: "fine-2",
          userId: "user-2",
          userName: "María López",
          userHouse: "Casa 27",
          reason: "Ruido excesivo después de las 23:00",
          amount: 800,
          status: "paid",
          createdAt: "2023-05-20T14:45:00Z",
          dueDate: "2023-06-20",
          lateFee: 150,
          paidAt: "2023-06-01T09:15:00Z",
          createdBy: "admin-1",
          paymentId: "payment-1",
        },
        {
          id: "fine-3",
          userId: "user-1",
          userName: "Juan Pérez",
          userHouse: "Casa 25",
          reason: "No recoger desechos de mascota",
          amount: 300,
          status: "overdue",
          createdAt: "2023-07-05T09:15:00Z",
          dueDate: "2023-07-20",
          lateFee: 50,
          createdBy: "admin-1",
        },
      ],

      addFine: (fine) => {
        const id = uuidv4()
        const createdAt = new Date().toISOString()

        const newFine: Fine = {
          ...fine,
          id,
          createdAt,
        }

        set((state) => ({
          fines: [newFine, ...state.fines],
        }))

        // Actualizar el estado de las multas después de agregar
        get().updateFinesStatus()

        return id
      },

      updateFine: (id, updates) => {
        set((state) => ({
          fines: state.fines.map((fine) => (fine.id === id ? { ...fine, ...updates } : fine)),
        }))
      },

      deleteFine: (id) => {
        set((state) => ({
          fines: state.fines.filter((fine) => fine.id !== id),
        }))
      },

      getFinesByUser: (userId) => {
        return get().fines.filter((fine) => fine.userId === userId)
      },

      getPendingFinesByUser: (userId) => {
        const userFines = get().fines.filter((fine) => fine.userId === userId)
        return userFines.filter((fine) => fine.status === "pending" || fine.status === "overdue")
      },

      markFineAsPaid: (fineId, paymentId) => {
        set((state) => ({
          fines: state.fines.map((fine) =>
            fine.id === fineId
              ? {
                  ...fine,
                  status: "paid" as const,
                  paidAt: new Date().toISOString(),
                  paymentId,
                }
              : fine,
          ),
        }))
      },

      updateFinesStatus: () => {
        const today = new Date()

        set((state) => ({
          fines: state.fines.map((fine) => {
            const dueDate = new Date(fine.dueDate)
            const isOverdue = fine.status === "pending" && today > dueDate
            const currentAmount = isOverdue ? fine.amount + fine.lateFee : fine.amount

            return {
              ...fine,
              status: isOverdue ? ("overdue" as const) : fine.status,
              isOverdue,
              currentAmount,
            }
          }),
        }))
      },
    }),
    {
      name: "fines-storage",
    },
  ),
)
