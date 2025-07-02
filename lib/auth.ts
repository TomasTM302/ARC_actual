import { create } from "zustand"
import bcrypt from "bcryptjs"

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
const initialUsers: (User & { password: string })[] = []

// Update the store implementation to include rememberMe and isMantenimiento
export const useAuthStore = create<AuthState>((set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isVigilante: false,
      isMantenimiento: false,
      users: initialUsers,
      rememberMe: false,

      login: async (credentials) => {
        const { email, password } = credentials
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          if (!res.ok || !data.success) {
            return { success: false, message: data.message || 'Credenciales incorrectas' }
          }
          const user = data.user as User
          set({
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isVigilante: user.role === 'vigilante',
            isMantenimiento: user.role === 'mantenimiento',
          })
          return { success: true }
        } catch (err) {
          console.error('Login error:', err)
          return { success: false, message: 'Error al iniciar sesión' }
        }
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

        const hashedPassword = await bcrypt.hash(userData.password, 10)

        const newUser = {
          ...userData,
          password: hashedPassword,
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
    }))
