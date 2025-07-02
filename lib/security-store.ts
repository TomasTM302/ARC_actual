import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface SecurityAlert {
  id: string
  houseId: string
  userId: string
  message: string
  createdAt: string
  attended: boolean
  attendedAt?: string
  attendedBy?: string
}

interface SecurityState {
  securityAlerts: SecurityAlert[]
  createSecurityAlert: (alert: Omit<SecurityAlert, "id" | "createdAt" | "attended">) => string
  markAlertAsAttended: (alertId: string, attendedBy?: string) => void
  getActiveAlerts: () => SecurityAlert[]
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      securityAlerts: [
        {
          id: "alert-1",
          houseId: "Casa 123",
          userId: "user-1",
          message: "Solicitud de asistencia de vigilancia",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
          attended: true,
          attendedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutos atrás
          attendedBy: "vigilante-1",
        },
        {
          id: "alert-2",
          houseId: "Casa 456",
          userId: "user-2",
          message: "Solicitud urgente de asistencia de vigilancia",
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutos atrás
          attended: false,
        },
        {
          id: "alert-3",
          houseId: "Casa 789",
          userId: "user-3",
          message: "Solicitud de asistencia de vigilancia",
          createdAt: new Date().toISOString(), // Ahora
          attended: false,
        },
      ],

      createSecurityAlert: (alert) => {
        const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const createdAt = new Date().toISOString()

        const newAlert = {
          ...alert,
          id,
          createdAt,
          attended: false,
        }

        set((state) => ({
          securityAlerts: [newAlert, ...state.securityAlerts],
        }))

        return id
      },

      markAlertAsAttended: (alertId, attendedBy) => {
        const now = new Date().toISOString()

        set((state) => ({
          securityAlerts: state.securityAlerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  attended: true,
                  attendedAt: now,
                  attendedBy: attendedBy || "unknown",
                }
              : alert,
          ),
        }))
      },

      getActiveAlerts: () => {
        return get().securityAlerts.filter((alert) => !alert.attended)
      },
    }),
    {
      name: "arcos-security-storage",
    },
  ),
)
