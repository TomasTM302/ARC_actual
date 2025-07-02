import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Condominium {
  id: string
  name: string
  address: string
  totalUnits: number
  imageUrl?: string
  createdAt: string
}

export interface CondominiumActivity {
  id: string
  condominiumId: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  createdAt: string
  completedAt?: string
  assignedTo?: string
  images?: string[]
}

interface CondominiumState {
  condominiums: Condominium[]
  activities: CondominiumActivity[]
  getCondominiumById: (id: string) => Condominium | undefined
  getActivitiesByCondominiumId: (condominiumId: string) => CondominiumActivity[]
  addActivity: (activity: Omit<CondominiumActivity, "id" | "createdAt">) => string
  updateActivityStatus: (id: string, status: CondominiumActivity["status"], completedAt?: string) => void
}

export const useCondominiumStore = create<CondominiumState>()(
  persist(
    (set, get) => ({
      condominiums: [
        {
          id: "condo-1",
          name: "Residencial Los Pinos",
          address: "Av. Principal #123, Zona Norte",
          totalUnits: 48,
          imageUrl: "/modern-residential-building.png",
          createdAt: new Date(Date.now() - 7776000000).toISOString(), // ~3 meses atrás
        },
        {
          id: "condo-2",
          name: "Torres del Valle",
          address: "Calle Secundaria #456, Zona Sur",
          totalUnits: 36,
          imageUrl: "/apartment-complex-garden.png",
          createdAt: new Date(Date.now() - 5184000000).toISOString(), // ~2 meses atrás
        },
        {
          id: "condo-3",
          name: "Jardines de la Montaña",
          address: "Blvd. Principal #789, Zona Este",
          totalUnits: 24,
          imageUrl: "/mountain-view-residence.png",
          createdAt: new Date(Date.now() - 2592000000).toISOString(), // ~1 mes atrás
        },
        {
          id: "condo-4",
          name: "Arcos del Río",
          address: "Av. Río Grande #321, Zona Oeste",
          totalUnits: 60,
          imageUrl: "/luxury-river-condo.png",
          createdAt: new Date(Date.now() - 1296000000).toISOString(), // ~15 días atrás
        },
      ],
      activities: [
        {
          id: "act-1",
          condominiumId: "condo-1",
          title: "Reparación de bomba de agua",
          description: "La bomba principal del sistema de agua presenta fugas y necesita ser reparada o reemplazada.",
          status: "completed",
          priority: "high",
          createdAt: new Date(Date.now() - 864000000).toISOString(), // ~10 días atrás
          completedAt: new Date(Date.now() - 691200000).toISOString(), // ~8 días atrás
          assignedTo: "Juan Pérez",
        },
        {
          id: "act-2",
          condominiumId: "condo-1",
          title: "Mantenimiento de jardines",
          description: "Poda de árboles y arbustos en áreas comunes del condominio.",
          status: "in-progress",
          priority: "medium",
          createdAt: new Date(Date.now() - 432000000).toISOString(), // ~5 días atrás
          assignedTo: "María Gómez",
        },
        {
          id: "act-3",
          condominiumId: "condo-2",
          title: "Reparación de iluminación",
          description: "Varias lámparas del estacionamiento no funcionan y necesitan ser reemplazadas.",
          status: "pending",
          priority: "medium",
          createdAt: new Date(Date.now() - 345600000).toISOString(), // ~4 días atrás
          assignedTo: "Carlos Rodríguez",
        },
        {
          id: "act-4",
          condominiumId: "condo-3",
          title: "Limpieza de alberca",
          description: "Mantenimiento rutinario de la alberca y sistema de filtración.",
          status: "completed",
          priority: "low",
          createdAt: new Date(Date.now() - 259200000).toISOString(), // ~3 días atrás
          completedAt: new Date(Date.now() - 172800000).toISOString(), // ~2 días atrás
          assignedTo: "Ana Martínez",
        },
        {
          id: "act-5",
          condominiumId: "condo-4",
          title: "Reparación de puerta de acceso",
          description: "La puerta principal de acceso al condominio no cierra correctamente.",
          status: "in-progress",
          priority: "high",
          createdAt: new Date(Date.now() - 172800000).toISOString(), // ~2 días atrás
          assignedTo: "Roberto Sánchez",
        },
        {
          id: "act-6",
          condominiumId: "condo-2",
          title: "Pintura de áreas comunes",
          description: "Repintar las paredes de los pasillos y áreas comunes que presentan deterioro.",
          status: "pending",
          priority: "low",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // ~1 día atrás
          assignedTo: "Laura Díaz",
        },
        {
          id: "act-7",
          condominiumId: "condo-3",
          title: "Revisión de sistema eléctrico",
          description: "Inspección general del sistema eléctrico de áreas comunes.",
          status: "pending",
          priority: "medium",
          createdAt: new Date().toISOString(), // hoy
          assignedTo: "Pedro Ramírez",
        },
      ],
      getCondominiumById: (id) => {
        return get().condominiums.find((condo) => condo.id === id)
      },
      getActivitiesByCondominiumId: (condominiumId) => {
        return get().activities.filter((activity) => activity.condominiumId === condominiumId)
      },
      addActivity: (activity) => {
        const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const newActivity = {
          ...activity,
          id,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          activities: [newActivity, ...state.activities],
        }))

        return id
      },
      updateActivityStatus: (id, status, completedAt) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id
              ? {
                  ...activity,
                  status,
                  completedAt: status === "completed" ? completedAt || new Date().toISOString() : activity.completedAt,
                }
              : activity,
          ),
        }))
      },
    }),
    {
      name: "condominium-storage",
    },
  ),
)
