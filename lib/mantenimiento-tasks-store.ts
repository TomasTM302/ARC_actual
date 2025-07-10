// Archivo migrado desde auxiliar-tasks-store.ts para unificar bajo mantenimiento
import { create } from "zustand"

export type TaskStatus = "pending" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  assignedBy: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  comments?: Comment[]
  isPersonalReminder?: boolean
  section?: string
  condominium?: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface Report {
  id: string
  title: string
  description: string
  mantenimientoId: string
  mantenimientoName: string
  createdAt: string
  images?: string[]
  taskId?: string
  status: "pending" | "reviewed" | "completed"
  section?: string
  condominium?: string
}

interface MantenimientoTasksState {
  tasks: Task[]
  reports: Report[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "comments" | "updatedAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  completeTask: (id: string) => void
  deleteTask: (id: string) => void
  addComment: (taskId: string, userId: string, userName: string, content: string) => void
  addReport: (report: Omit<Report, "id" | "createdAt">) => void
  updateReport: (id: string, updates: Partial<Report>) => void
  deleteReport: (id: string) => void
}

export const useMantenimientoTasksStore = create<MantenimientoTasksState>((set) => ({
  tasks: [],
  reports: [],
  addTask: (task) => {
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
        },
      ],
    }))
  },
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
      ),
    }))
  },
  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: "completed" } : task)),
    }))
  },
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }))
  },
  addComment: (taskId, userId, userName, content) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [
                ...(task.comments || []),
                {
                  id: `comment-${Date.now()}`,
                  taskId,
                  userId,
                  userName,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : task,
      ),
    }))
  },
  addReport: (report) => {
    set((state) => ({
      reports: [
        ...state.reports,
        {
          ...report,
          id: `report-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
  },
  updateReport: (id, updates) => {
    set((state) => ({
      reports: state.reports.map((report) => (report.id === id ? { ...report, ...updates } : report)),
    }))
  },
  deleteReport: (id) => {
    set((state) => ({
      reports: state.reports.filter((report) => report.id !== id),
    }))
  },
}))
