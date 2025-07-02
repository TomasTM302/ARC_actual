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

// Nuevo modelo para el desglose de pagos
export interface PaymentBreakdown {
  // Cuota mensual regular
  maintenance?: number

  // Recargos por pago tardío
  surcharges?: number

  // Cuotas recuperadas de meses anteriores
  recoveredPayments?: {
    month: number
    year: number
    amount: number
  }[]

  // Multas
  fines?: {
    id: string
    description: string
    amount: number
  }[]

  // Convenios de pago
  agreements?: {
    id: string
    description: string
    amount: number
  }[]

  // Cuotas adelantadas
  advancePayments?: {
    month: number
    year: number
    amount: number
  }[]

  // Eventos en áreas comunes
  events?: {
    areaId: string
    areaName: string
    date: string
    amount: number
  }[]

  // Otros conceptos
  others?: {
    description: string
    amount: number
  }[]
}

// Add new interfaces for resident information and enhanced payment tracking

// Add after the existing interfaces, before MaintenancePayment interface:

// Información del residente para pagos
export interface ResidentInfo {
  name: string
  street: string
  houseNumber: string
  phone?: string
  email?: string
}

// Update the MaintenancePayment interface to include resident information and tracking:
export interface MaintenancePayment {
  id: string
  userId: string
  userName: string
  // Nueva información del residente
  residentInfo: ResidentInfo
  amount: number
  paymentDate: string
  paymentMethod: "transfer" | "credit_card"
  status: "pending" | "completed" | "rejected"
  receiptUrl?: string
  notes?: string
  month: number
  year: number
  createdAt: string
  updatedAt: string
  updatedBy?: string
  // Campo para desglose de pagos
  breakdown?: PaymentBreakdown
  // Clave de rastreo
  trackingKey?: string
  // Estado del colono
  residentStatus?: "Ordinario" | "Moroso" | "Al corriente" | "Nuevo"
  // Comentarios adicionales
  comments?: string
}

// Interfaz para pagos de mantenimiento - Actualizada con desglose
// Add tracking key generation function before the useAppStore:
// Función para generar clave de rastreo
const generateTrackingKey = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${timestamp.slice(-6)}${random}`
}

export interface AdminTask {
  id: string
  title: string
  description: string
  status: "pending" | "inProgress" | "completed"
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
  // Nueva función para obtener pagos categorizados por mes y año
  getCategorizedPaymentsByMonth: (month: number, year: number) => Record<string, number>
  // Nueva función para obtener pagos categorizados por rango de meses
  getCategorizedPaymentsByRange: (
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number,
  ) => Record<string, number[]>
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
      // Pagos de mantenimiento iniciales (datos de ejemplo con desglose)
      maintenancePayments: [
        {
          id: "payment-1",
          userId: "user-1",
          userName: "Juan Pérez",
          residentInfo: {
            name: "Juan Pérez",
            street: "Paseo del Cedro",
            houseNumber: "25",
            phone: "555-0123",
            email: "juan.perez@email.com",
          },
          amount: 1500,
          paymentDate: "2023-04-05T10:30:00.000Z",
          paymentMethod: "transfer",
          status: "completed",
          month: 4,
          year: 2023,
          createdAt: "2023-04-05T10:30:00.000Z",
          updatedAt: "2023-04-05T10:30:00.000Z",
          trackingKey: "089900485594334248",
          residentStatus: "Ordinario",
          breakdown: {
            maintenance: 1500,
          },
        },
        {
          id: "payment-2",
          userId: "user-2",
          userName: "María López",
          residentInfo: {
            name: "María López",
            street: "Paseo del Cedro",
            houseNumber: "27",
            phone: "555-0124",
            email: "maria.lopez@email.com",
          },
          amount: 1500,
          paymentDate: "2023-04-08T14:20:00.000Z",
          paymentMethod: "credit_card",
          status: "completed",
          month: 4,
          year: 2023,
          createdAt: "2023-04-08T14:20:00.000Z",
          updatedAt: "2023-04-08T14:20:00.000Z",
          trackingKey: "100241205000800",
          residentStatus: "Ordinario",
          breakdown: {
            maintenance: 1500,
          },
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
        const trackingKey = generateTrackingKey()

        const newPayment = {
          ...payment,
          id,
          createdAt: now,
          updatedAt: now,
          trackingKey,
          residentStatus: payment.residentStatus || "Ordinario",
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

      // Nueva función para obtener pagos categorizados por mes y año
      getCategorizedPaymentsByMonth: (month, year) => {
        const payments = get().maintenancePayments.filter(
          (payment) => payment.month === month && payment.year === year && payment.status === "completed",
        )

        // Inicializar categorías
        const categories = {
          maintenance: 0,
          surcharges: 0,
          recoveredPayments: 0,
          fines: 0,
          agreements: 0,
          advancePayments: 0,
          events: 0,
          others: 0,
        }

        // Sumar los montos por categoría
        payments.forEach((payment) => {
          if (payment.breakdown) {
            // Cuota de mantenimiento
            if (payment.breakdown.maintenance) {
              categories.maintenance += payment.breakdown.maintenance
            }

            // Recargos
            if (payment.breakdown.surcharges) {
              categories.surcharges += payment.breakdown.surcharges
            }

            // Pagos recuperados
            if (payment.breakdown.recoveredPayments) {
              categories.recoveredPayments += payment.breakdown.recoveredPayments.reduce(
                (sum, item) => sum + item.amount,
                0,
              )
            }

            // Multas
            if (payment.breakdown.fines) {
              categories.fines += payment.breakdown.fines.reduce((sum, fine) => sum + fine.amount, 0)
            }

            // Convenios
            if (payment.breakdown.agreements) {
              categories.agreements += payment.breakdown.agreements.reduce(
                (sum, agreement) => sum + agreement.amount,
                0,
              )
            }

            // Pagos adelantados
            if (payment.breakdown.advancePayments) {
              categories.advancePayments += payment.breakdown.advancePayments.reduce(
                (sum, item) => sum + item.amount,
                0,
              )
            }

            // Eventos
            if (payment.breakdown.events) {
              categories.events += payment.breakdown.events.reduce((sum, event) => sum + event.amount, 0)
            }

            // Otros
            if (payment.breakdown.others) {
              categories.others += payment.breakdown.others.reduce((sum, item) => sum + item.amount, 0)
            }
          } else {
            // Si no hay desglose, asumimos que todo es cuota de mantenimiento
            categories.maintenance += payment.amount
          }
        })

        return categories
      },

      // Nueva función para obtener pagos categorizados por rango de meses
      getCategorizedPaymentsByRange: (startMonth, startYear, endMonth, endYear) => {
        // Crear un array de meses en el rango
        const months = []
        let currentYear = startYear
        let currentMonth = startMonth

        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
          months.push({ month: currentMonth, year: currentYear })

          if (currentMonth === 12) {
            currentMonth = 1
            currentYear++
          } else {
            currentMonth++
          }
        }

        // Inicializar categorías para cada mes
        const categories = {
          maintenance: Array(months.length).fill(0),
          surcharges: Array(months.length).fill(0),
          recoveredPayments: Array(months.length).fill(0),
          fines: Array(months.length).fill(0),
          agreements: Array(months.length).fill(0),
          advancePayments: Array(months.length).fill(0),
          events: Array(months.length).fill(0),
          others: Array(months.length).fill(0),
        }

        // Procesar cada mes
        months.forEach((monthData, index) => {
          const monthCategories = get().getCategorizedPaymentsByMonth(monthData.month, monthData.year)

          // Asignar valores al array correspondiente
          categories.maintenance[index] = monthCategories.maintenance
          categories.surcharges[index] = monthCategories.surcharges
          categories.recoveredPayments[index] = monthCategories.recoveredPayments
          categories.fines[index] = monthCategories.fines
          categories.agreements[index] = monthCategories.agreements
          categories.advancePayments[index] = monthCategories.advancePayments
          categories.events[index] = monthCategories.events
          categories.others[index] = monthCategories.others
        })

        return categories
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
