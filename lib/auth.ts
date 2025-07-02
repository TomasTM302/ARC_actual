import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "admin" | "resident" | "vigilante" | "mantenimiento"

// Actualizar la interfaz User para asegurar que siempre tenga la propiedad house
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  house: string
  role: UserRole
  createdAt: string
}

interface Credentials {
  email: string
  password: string
}

// Update the AuthState interface to include rememberMe option
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isVigilante: boolean
  isMantenimiento: boolean
  users: User[]
  rememberMe: boolean
  login: (credentials: Credentials) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  register: (
    userData: Omit<User, "id" | "createdAt"> & { password: string },
  ) => Promise<{ success: boolean; message?: string }>
  getUsers: () => User[]
  setRememberMe: (value: boolean) => void
  resetStore: () => void // Añadimos una función para resetear el store
}

// Mock users for demonstration
const initialUsers: (User & { password: string })[] = [
  {
    id: "admin-1",
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@arcos.com",
    phone: "1234567890",
    house: "Administración",
    role: "admin",
    password: "admin123", // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
  },
  {
    id: "resident-1",
    firstName: "Usuario",
    lastName: "Residente",
    email: "residente@ejemplo.com",
    phone: "9876543210",
    house: "Casa 42",
    role: "resident",
    password: "123456", // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
  },
  {
    id: "vigilante-1",
    firstName: "Guardia",
    lastName: "Seguridad",
    email: "vigilante@arcos.com",
    phone: "5551234567",
    house: "Caseta de vigilancia",
    role: "vigilante",
    password: "vigilante123", // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
  },
  {
    id: "mantenimiento-1",
    firstName: "Personal",
    lastName: "Mantenimiento",
    email: "mantenimiento@arcos.com",
    phone: "5559876543",
    house: "Mantenimiento",
    role: "mantenimiento", // Aseguramos que el rol sea "mantenimiento"
    password: "mantenimiento123", // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
  },
]

// Update the store implementation to include rememberMe and isMantenimiento
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isVigilante: false,
      isMantenimiento: false,
      users: initialUsers,
      rememberMe: false,

      login: async (credentials) => {
        // In a real app, this would be an API call
        const { email, password } = credentials
        const user = get().users.find((u) => u.email === email && (u as any).password === password)

        if (!user) {
          return { success: false, message: "Credenciales incorrectas" }
        }

        // Don't include password in the user state
        const { password: _, ...userWithoutPassword } = user as any

        // Asegurarse de que isMantenimiento se establezca correctamente
        set({
          user: userWithoutPassword,
          isAuthenticated: true,
          isAdmin: userWithoutPassword.role === "admin",
          isVigilante: userWithoutPassword.role === "vigilante",
          isMantenimiento: userWithoutPassword.role === "mantenimiento",
        })

        console.log(
          "Login successful, role:",
          userWithoutPassword.role,
          "isMantenimiento:",
          userWithoutPassword.role === "mantenimiento",
        )

        return { success: true }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isVigilante: false,
          isMantenimiento: false,
        })
      },

      register: async (userData) => {
        // Check if current user is admin
        if (!get().isAdmin) {
          return { success: false, message: "No tienes permisos para registrar usuarios" }
        }

        // Check if email already exists
        if (get().users.some((u) => u.email === userData.email)) {
          return { success: false, message: "El correo electrónico ya está registrado" }
        }

        const newUser = {
          ...userData,
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser as any],
        }))

        return { success: true }
      },

      getUsers: () => {
        return get().users.map((user) => {
          // Ensure password is not included
          const { password, ...userWithoutPassword } = user as any
          return userWithoutPassword
        })
      },

      setRememberMe: (value: boolean) => {
        set({ rememberMe: value })
      },

      // Función para resetear el store a su estado inicial
      resetStore: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isVigilante: false,
          isMantenimiento: false,
          users: initialUsers,
          rememberMe: false,
        })
      },
    }),
    {
      name: "arcos-auth-storage",
      // Only persist if rememberMe is true
      partialize: (state) =>
        state.rememberMe
          ? {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              isAdmin: state.isAdmin,
              isVigilante: state.isVigilante,
              isMantenimiento: state.isMantenimiento,
              rememberMe: state.rememberMe,
              users: state.users,
            }
          : { rememberMe: state.rememberMe, users: state.users },
    },
  ),
)
