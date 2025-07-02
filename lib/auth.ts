import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "admin" | "resident" | "vigilante" | "mantenimiento"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  house: string
  condominiumId: string
  role: UserRole
  createdAt: string
}

interface Credentials {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  house: string
  condominiumId: string
  password: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isVigilante: boolean
  isMantenimiento: boolean
  rememberMe: boolean
  users: User[]
  login: (credentials: Credentials) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  setRememberMe: (value: boolean) => void
  fetchUsers: () => Promise<void>
  getUsers: () => User[]
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>
  resetStore: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isVigilante: false,
      isMantenimiento: false,
      rememberMe: false,
      users: [],

      login: async (credentials) => {
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })

          const data = await res.json()
          if (!res.ok || !data.success) {
            return { success: false, message: data.message || 'Credenciales incorrectas' }
          }

          const { user, token } = data
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isVigilante: user.role === 'vigilante',
            isMantenimiento: user.role === 'mantenimiento',
          })

          return { success: true }
        } catch (err) {
          console.error(err)
          return { success: false, message: 'Error de servidor' }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isVigilante: false,
          isMantenimiento: false,
        })

        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
      },

      setRememberMe: (value: boolean) => {
        set({ rememberMe: value })
      },

      fetchUsers: async () => {
        try {
          const res = await fetch('/api/users')
          const data = await res.json()
          if (res.ok && data.success) {
            set({ users: data.users })
          }
        } catch (err) {
          console.error(err)
        }
      },

      getUsers: () => {
        return get().users
      },

      register: async (data: RegisterData) => {
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          const result = await res.json()
          if (res.ok && result.success) {
            set({ users: [...get().users, result.user] })
            return { success: true }
          }
          return { success: false, message: result.message || 'Error al registrar' }
        } catch (err) {
          console.error(err)
          return { success: false, message: 'Error de servidor' }
        }
      },

      deleteUser: async (id: string) => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
          const data = await res.json()
          if (res.ok && data.success) {
            set({ users: get().users.filter((u) => u.id !== id) })
            return { success: true }
          }
          return { success: false, message: data.message || 'Error al eliminar' }
        } catch (err) {
          console.error(err)
          return { success: false, message: 'Error de servidor' }
        }
      },

      resetStore: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isVigilante: false,
          isMantenimiento: false,
          rememberMe: false,
          users: [],
        })
      },
    }),
    {
      name: "arcos-auth-storage",
      partialize: (state) =>
        state.rememberMe
          ? {
              user: state.user,
              token: state.token,
              isAuthenticated: state.isAuthenticated,
              isAdmin: state.isAdmin,
              isVigilante: state.isVigilante,
              isMantenimiento: state.isMantenimiento,
              rememberMe: state.rememberMe,
            }
          : { rememberMe: state.rememberMe },
    },
  ),
)
