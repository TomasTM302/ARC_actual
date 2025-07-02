import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

export interface PetReport {
  id: string
  petName: string
  petType: string
  petBreed: string
  petColor: string
  characteristics: string
  lostDate: string
  lostTime: string
  lostLocation: string
  details: string
  contactName: string
  contactPhone: string
  contactEmail: string
  images: string[]
  createdAt: string
}

export interface Notice {
  id: string
  title: string
  description: string
  type: "pet" | "general" | "emergency" | "maintenance"
  relatedId?: string
  imageUrl?: string
  createdAt: string
  isRead: boolean
}

// Nuevo modelo para comercios cercanos
export interface NearbyBusiness {
  id: string
  name: string
  imageUrl: string
  websiteUrl: string
  category: string
  createdAt: string
  createdBy: string
}

// Historial de precios de mantenimiento
export interface MaintenancePriceHistory {
  id: string
  price: number
  effectiveDate: string
  createdBy: string
  createdAt: string
  notes?: string
}

// Actualizar la interfaz BankingDetails para eliminar el campo accountNumber
export interface BankingDetails {
  bankName: string
  accountHolder: string
  clabe: string
  reference?: string
  updatedAt: string
  updatedBy: string
}

// Interfaz para pagos de mantenimiento - Actualizada para solo usar transferencia y tarjeta
export interface MaintenancePayment {
  id: string
  userId: string
  userName: string
  amount: number
  paymentDate: string
  paymentMethod: "transfer" | "credit_card" // Actualizado: solo transferencia o tarjeta
  status: "pending" | "completed" | "rejected"
  receiptUrl?: string
  notes?: string
  month: number
  year: number
  createdAt: string
  updatedAt: string
  updatedBy?: string
}

// Nueva interfaz para tareas administrativas
export interface AdminTask {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  dueDate?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// Actualizar la interfaz AppState para incluir datos bancarios
interface AppState {
  petReports: PetReport[]
  notices: Notice[]
  // Precio actual de mantenimiento
  maintenancePrice: number
  // Fecha límite de pago (día del mes)
  maintenanceDueDay: number
  // Recargo por pago tardío
  maintenanceLatePaymentFee: number
  // Historial de cambios de precio
  maintenancePriceHistory: MaintenancePriceHistory[]
  // Comercios cercanos
  nearbyBusinesses: NearbyBusiness[]
  // Datos bancarios para pagos por transferencia
  bankingDetails: BankingDetails | null
  // Pagos de mantenimiento
  maintenancePayments: MaintenancePayment[]
  // Estado para tareas administrativas
  adminTasks: AdminTask[]
  addPetReport: (report: Omit<PetReport, "id" | "createdAt">) => string
  addNotice: (notice: Omit<Notice, "id" | "createdAt" | "isRead">) => string
  markNoticeAsRead: (id: string) => void
  deleteNotice: (id: string) => void
  updateNotice: (id: string, updatedNotice: Partial<Omit<Notice, "id" | "createdAt">>) => void
  getPetReportById: (id: string) => PetReport | undefined
  // Función para actualizar el precio de mantenimiento
  updateMaintenancePrice: (newPrice: number, userId: string, notes?: string) => void
  // Función para actualizar la fecha límite de pago
  updateMaintenanceDueDay: (newDueDay: number, userId: string, notes?: string) => void
  // Función para actualizar el recargo por pago tardío
  updateMaintenanceLatePaymentFee: (newFee: number, userId: string, notes?: string) => void
  // Funciones para comercios cercanos
  addNearbyBusiness: (business: Omit<NearbyBusiness, "id" | "createdAt">) => string
  updateNearbyBusiness: (id: string, updatedBusiness: Partial<Omit<NearbyBusiness, "id" | "createdAt">>) => void
  deleteNearbyBusiness: (id: string) => void
  // Función para actualizar datos bancarios
  updateBankingDetails: (details: Omit<BankingDetails, "updatedAt"> & { skipNotification?: boolean }) => void
  // Funciones para pagos de mantenimiento
  addMaintenancePayment: (payment: Omit<MaintenancePayment, "id" | "createdAt" | "updatedAt">) => string
  updateMaintenancePayment: (id: string, updatedPayment: Partial<Omit<MaintenancePayment, "id" | "createdAt">>) => void
  deleteMaintenancePayment: (id: string) => void
  getMaintenancePaymentsByUser: (userId: string) => MaintenancePayment[]
  getMaintenancePaymentsByMonth: (month: number, year: number) => MaintenancePayment[]
  addAdminTask: (task: Omit<AdminTask, "id" | "createdAt" | "completedAt">) => void
  updateAdminTask: (id: string, updates: Partial<AdminTask>) => void
  completeAdminTask: (id: string) => void
  deleteAdminTask: (id: string) => void
}

// Actualizar el estado inicial y las funciones
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      petReports: [],
      notices: [],
      // Precio inicial de mantenimiento
      maintenancePrice: 1500,
      // Día de pago predeterminado (día 10 de cada mes)
      maintenanceDueDay: 10,
      // Recargo por pago tardío predeterminado
      maintenanceLatePaymentFee: 200,
      // Historial de precios vacío inicialmente
      maintenancePriceHistory: [
        {
          id: `price-${Date.now()}`,
          price: 1500,
          effectiveDate: new Date().toISOString(),
          createdBy: "admin-1",
          createdAt: new Date().toISOString(),
          notes: "Precio inicial de mantenimiento",
        },
      ],
      // Datos bancarios iniciales (null)
      bankingDetails: null,
      // Comercios cercanos iniciales
      nearbyBusinesses: [
        {
          id: "business-1",
          name: "Supermercado El Ahorro",
          imageUrl: "/placeholder.svg?height=200&width=200",
          websiteUrl: "https://www.example.com/supermercado",
          category: "Supermercado",
          createdAt: new Date().toISOString(),
          createdBy: "admin-1",
        },
        {
          id: "business-2",
          name: "Farmacia Salud",
          imageUrl: "/placeholder.svg?height=200&width=200",
          websiteUrl: "https://www.example.com/farmacia",
          category: "Farmacia",
          createdAt: new Date().toISOString(),
          createdBy: "admin-1",
        },
        {
          id: "business-3",
          name: "Restaurante La Buena Mesa",
          imageUrl: "/placeholder.svg?height=200&width=200",
          websiteUrl: "https://www.example.com/restaurante",
          category: "Restaurante",
          createdAt: new Date().toISOString(),
          createdBy: "admin-1",
        },
      ],
      // Pagos de mantenimiento iniciales (datos de ejemplo)
      maintenancePayments: [
        {
          id: "payment-1",
          userId: "user-1",
          userName: "Juan Pérez",
          amount: 1500,
          paymentDate: "2023-04-05T10:30:00.000Z",
          paymentMethod: "transfer",
          status: "completed",
          month: 4,
          year: 2023,
          createdAt: "2023-04-05T10:30:00.000Z",
          updatedAt: "2023-04-05T10:30:00.000Z",
        },
        {
          id: "payment-2",
          userId: "user-2",
          userName: "María López",
          amount: 1500,
          paymentDate: "2023-04-08T14:20:00.000Z",
          paymentMethod: "credit_card",
          status: "completed",
          month: 4,
          year: 2023,
          createdAt: "2023-04-08T14:20:00.000Z",
          updatedAt: "2023-04-08T14:20:00.000Z",
        },
        {
          id: "payment-3",
          userId: "user-3",
          userName: "Carlos Rodríguez",
          amount: 1700,
          paymentDate: "2023-04-12T09:15:00.000Z",
          paymentMethod: "transfer",
          status: "completed",
          notes: "Incluye recargo por pago tardío",
          month: 4,
          year: 2023,
          createdAt: "2023-04-12T09:15:00.000Z",
          updatedAt: "2023-04-12T09:15:00.000Z",
        },
        {
          id: "payment-4",
          userId: "user-1",
          userName: "Juan Pérez",
          amount: 1500,
          paymentDate: "2023-05-07T11:45:00.000Z",
          paymentMethod: "transfer",
          status: "completed",
          month: 5,
          year: 2023,
          createdAt: "2023-05-07T11:45:00.000Z",
          updatedAt: "2023-05-07T11:45:00.000Z",
        },
        {
          id: "payment-5",
          userId: "user-4",
          userName: "Ana Martínez",
          amount: 1500,
          paymentDate: "2023-05-09T16:30:00.000Z",
          paymentMethod: "credit_card",
          status: "completed",
          month: 5,
          year: 2023,
          createdAt: "2023-05-09T16:30:00.000Z",
          updatedAt: "2023-05-09T16:30:00.000Z",
        },
        {
          id: "payment-6",
          userId: "user-5",
          userName: "Roberto Gómez",
          amount: 1500,
          paymentDate: "2023-05-10T10:00:00.000Z",
          paymentMethod: "credit_card",
          status: "pending",
          month: 5,
          year: 2023,
          createdAt: "2023-05-10T10:00:00.000Z",
          updatedAt: "2023-05-10T10:00:00.000Z",
        },
        // Nuevo pago de ejemplo para probar el botón de acción
        {
          id: "payment-7",
          userId: "user-6",
          userName: "Laura Sánchez",
          amount: 1500,
          paymentDate: new Date().toISOString(),
          paymentMethod: "transfer",
          status: "pending",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      // Estado inicial para tareas administrativas
      adminTasks: [
        {
          id: "1",
          title: "Revisar solicitudes de mantenimiento",
          description: "Revisar y aprobar las solicitudes de mantenimiento pendientes",
          priority: "high",
          status: "pending",
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
        },
        {
          id: "2",
          title: "Actualizar reglamento de áreas comunes",
          description: "Incorporar los cambios aprobados en la última junta directiva",
          priority: "medium",
          status: "in-progress",
          createdAt: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          dueDate: new Date(Date.now() + 604800000).toISOString(), // En una semana
        },
        {
          id: "3",
          title: "Enviar recordatorios de pago",
          description: "Enviar recordatorios a residentes con pagos pendientes",
          priority: "high",
          status: "completed",
          createdAt: new Date(Date.now() - 345600000).toISOString(), // Hace 4 días
          completedAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
        },
        {
          id: "4",
          title: "Coordinar mantenimiento de jardines",
          description: "Programar el mantenimiento mensual de jardines y áreas verdes",
          priority: "medium",
          status: "pending",
          createdAt: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
          dueDate: new Date(Date.now() + 345600000).toISOString(), // En 4 días
        },
        {
          id: "5",
          title: "Revisar presupuesto trimestral",
          description: "Analizar gastos del trimestre y preparar informe para residentes",
          priority: "low",
          status: "in-progress",
          createdAt: new Date(Date.now() - 432000000).toISOString(), // Hace 5 días
          dueDate: new Date(Date.now() + 172800000).toISOString(), // En 2 días
        },
      ],

      addPetReport: (report) => {
        const id = `pet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const createdAt = new Date().toISOString()

        const newReport = {
          ...report,
          id,
          createdAt,
        }

        set((state) => ({
          petReports: [newReport, ...state.petReports],
        }))

        return id
      },

      addNotice: (notice) => {
        const id = `notice-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const createdAt = new Date().toISOString()

        const newNotice = {
          ...notice,
          id,
          createdAt,
          isRead: false,
        }

        set((state) => ({
          notices: [newNotice, ...state.notices],
        }))

        return id
      },

      markNoticeAsRead: (id) => {
        set((state) => ({
          notices: state.notices.map((notice) => (notice.id === id ? { ...notice, isRead: true } : notice)),
        }))
      },

      deleteNotice: (id) => {
        set((state) => ({
          notices: state.notices.filter((notice) => notice.id !== id),
        }))
      },

      updateNotice: (id, updatedNotice) => {
        set((state) => ({
          notices: state.notices.map((notice) => (notice.id === id ? { ...notice, ...updatedNotice } : notice)),
        }))
      },

      getPetReportById: (id) => {
        return get().petReports.find((report) => report.id === id)
      },

      // Función para actualizar el precio de mantenimiento
      updateMaintenancePrice: (newPrice, userId, notes) => {
        const id = `price-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const now = new Date().toISOString()

        // Crear nuevo registro en el historial
        const newPriceRecord: MaintenancePriceHistory = {
          id,
          price: newPrice,
          effectiveDate: now,
          createdBy: userId,
          createdAt: now,
          notes: notes || `Actualización de precio de ${get().maintenancePrice} a ${newPrice}`,
        }

        // Actualizar el estado
        set((state) => ({
          maintenancePrice: newPrice,
          maintenancePriceHistory: [newPriceRecord, ...state.maintenancePriceHistory],
        }))

        // Crear un aviso sobre el cambio de precio
        get().addNotice({
          title: "Actualización de cuota de mantenimiento",
          description: `La cuota mensual de mantenimiento ha sido actualizada a ${newPrice.toLocaleString()}. Efectiva a partir de ahora.`,
          type: "maintenance",
        })
      },

      // Función para actualizar la fecha límite de pago
      updateMaintenanceDueDay: (newDueDay, userId, notes) => {
        const now = new Date().toISOString()

        // Validar que el día sea válido (entre 1 y 28)
        const validDueDay = Math.max(1, Math.min(28, newDueDay))

        // Actualizar el estado
        set((state) => ({
          maintenanceDueDay: validDueDay,
        }))

        // Crear un aviso sobre el cambio de fecha límite
        get().addNotice({
          title: "Actualización de fecha límite de pago",
          description: `La fecha límite de pago de mantenimiento ha sido actualizada al día ${validDueDay} de cada mes. Efectiva a partir de ahora.`,
          type: "maintenance",
          notes,
        })
      },

      // Función para actualizar el recargo por pago tardío
      updateMaintenanceLatePaymentFee: (newFee, userId, notes) => {
        const now = new Date().toISOString()

        // Actualizar el estado
        set((state) => ({
          maintenanceLatePaymentFee: newFee,
        }))

        // Crear un aviso sobre el cambio de recargo
        get().addNotice({
          title: "Actualización de recargo por pago tardío",
          description: `El recargo por pago tardío de mantenimiento ha sido actualizado a ${newFee.toLocaleString()}. Efectivo a partir de ahora.`,
          type: "maintenance",
          notes,
        })
      },

      // Funciones para comercios cercanos
      addNearbyBusiness: (business) => {
        const id = `business-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const createdAt = new Date().toISOString()

        const newBusiness = {
          ...business,
          id,
          createdAt,
        }

        set((state) => ({
          nearbyBusinesses: [...state.nearbyBusinesses, newBusiness],
        }))

        return id
      },

      updateNearbyBusiness: (id, updatedBusiness) => {
        set((state) => ({
          nearbyBusinesses: state.nearbyBusinesses.map((business) =>
            business.id === id ? { ...business, ...updatedBusiness } : business,
          ),
        }))
      },

      deleteNearbyBusiness: (id) => {
        set((state) => ({
          nearbyBusinesses: state.nearbyBusinesses.filter((business) => business.id !== id),
        }))
      },

      // Función para actualizar datos bancarios
      updateBankingDetails: (details: Omit<BankingDetails, "updatedAt"> & { skipNotification?: boolean }) => {
        const now = new Date().toISOString()

        set({
          bankingDetails: {
            ...details,
            updatedAt: now,
          },
        })

        // Crear un aviso sobre la actualización de datos bancarios solo si no se especifica skipNotification
        if (!details.skipNotification) {
          get().addNotice({
            title: "Actualización de datos bancarios",
            description:
              "Los datos bancarios para pagos de mantenimiento han sido actualizados. Por favor, verifique la información antes de realizar transferencias.",
            type: "maintenance",
          })
        }
      },

      // Funciones para pagos de mantenimiento
      addMaintenancePayment: (payment) => {
        const id = `payment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const now = new Date().toISOString()

        const newPayment = {
          ...payment,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          maintenancePayments: [...state.maintenancePayments, newPayment],
        }))

        return id
      },

      updateMaintenancePayment: (id, updatedPayment) => {
        const now = new Date().toISOString()

        set((state) => ({
          maintenancePayments: state.maintenancePayments.map((payment) =>
            payment.id === id
              ? {
                  ...payment,
                  ...updatedPayment,
                  updatedAt: now,
                }
              : payment,
          ),
        }))
      },

      deleteMaintenancePayment: (id) => {
        set((state) => ({
          maintenancePayments: state.maintenancePayments.filter((payment) => payment.id !== id),
        }))
      },

      getMaintenancePaymentsByUser: (userId) => {
        return get().maintenancePayments.filter((payment) => payment.userId === userId)
      },

      getMaintenancePaymentsByMonth: (month, year) => {
        return get().maintenancePayments.filter((payment) => payment.month === month && payment.year === year)
      },

      // Acciones para tareas administrativas
      addAdminTask: (task) =>
        set((state) => ({
          adminTasks: [
            ...state.adminTasks,
            {
              ...task,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateAdminTask: (id, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          adminTasks: state.adminTasks.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: now } : task)),
        }))
      },

      completeAdminTask: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          adminTasks: state.adminTasks.map((task) =>
            task.id === id
              ? { ...task, status: "completed", completedAt: new Date().toISOString(), updatedAt: now }
              : task,
          ),
        }))
      },

      deleteAdminTask: (id) =>
        set((state) => ({
          adminTasks: state.adminTasks.filter((task) => task.id !== id),
        })),
    }),
    {
      name: "arcos-app-storage",
    },
  ),
)
