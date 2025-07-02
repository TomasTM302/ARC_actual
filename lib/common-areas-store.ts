import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CommonArea {
  id: string
  name: string
  description: string
  type: "common" | "private"
  icon: string
  deposit: number
  operatingHours: string
  maxDuration: number
  maxPeople: number
  isActive: boolean
  details?: string[]
  maxAdvanceBookingDays: number
  maxSimultaneousBookings?: number
  currentBookings?: number
}

interface CommonAreasState {
  areas: CommonArea[]
  getAreaById: (id: string) => CommonArea | undefined
  updateArea: (id: string, updates: Partial<CommonArea>) => void
  toggleAreaStatus: (id: string) => void
  addArea: (area: CommonArea) => void
  removeArea: (id: string) => void
}

export const useCommonAreasStore = create<CommonAreasState>()(
  persist(
    (set, get) => ({
      areas: [
        {
          id: "asadores",
          name: "Asadores",
          description: "Área de asadores con capacidad para hasta 20 personas, ideal para reuniones familiares.",
          type: "common",
          icon: "utensils",
          deposit: 1000,
          operatingHours: "08:00 - 22:00",
          maxDuration: 5,
          maxPeople: 5,
          isActive: true,
          details: [
            "2 asadores grandes con parrillas",
            "Mesas y bancas para 20 personas",
            "Área techada",
            "Iluminación para uso nocturno",
            "Acceso a baños",
          ],
          maxAdvanceBookingDays: 7,
        },
        {
          id: "alberca",
          name: "Alberca",
          description: "Alberca con área de descanso. Disponible para reservación con máximo 1 semana de anticipación.",
          type: "common",
          icon: "waves",
          deposit: 1500,
          operatingHours: "08:00 - 20:00",
          maxDuration: 4,
          maxPeople: 8,
          isActive: true,
          maxAdvanceBookingDays: 7,
          maxSimultaneousBookings: 8,
          currentBookings: 3,
        },
        {
          id: "bar",
          name: "Bar",
          description: "Bar con refrigerador y espacio para preparación de bebidas.",
          type: "common",
          icon: "glass-water",
          deposit: 800,
          operatingHours: "08:00 - 22:00",
          maxDuration: 5,
          maxPeople: 5,
          isActive: true,
          maxAdvanceBookingDays: 7,
        },
        {
          id: "salon",
          name: "Salón de eventos",
          description: "Salón de eventos con capacidad para hasta 50 personas, ideal para celebraciones y reuniones.",
          type: "private",
          icon: "users",
          deposit: 3000,
          operatingHours: "10:00 - 22:00",
          maxDuration: 8,
          maxPeople: 50,
          isActive: true,
          maxAdvanceBookingDays: 30,
        },
        {
          id: "terraza",
          name: "Terraza",
          description: "Terraza al aire libre con vista panorámica, ideal para eventos sociales.",
          type: "private",
          icon: "utensils",
          deposit: 2500,
          operatingHours: "11:00 - 23:00",
          maxDuration: 6,
          maxPeople: 30,
          isActive: true,
          maxAdvanceBookingDays: 21,
        },
      ],

      getAreaById: (id) => {
        return get().areas.find((area) => area.id === id)
      },

      updateArea: (id, updates) => {
        set((state) => ({
          areas: state.areas.map((area) => (area.id === id ? { ...area, ...updates } : area)),
        }))
      },

      toggleAreaStatus: (id) => {
        set((state) => ({
          areas: state.areas.map((area) => (area.id === id ? { ...area, isActive: !area.isActive } : area)),
        }))
      },

      addArea: (area) => {
        set((state) => ({
          areas: [...state.areas, area],
        }))
      },

      removeArea: (id) => {
        set((state) => ({
          areas: state.areas.filter((area) => area.id !== id),
        }))
      },
    }),
    {
      name: "common-areas-storage",
    },
  ),
)
