"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { useMantenimientoTasksStore, type Task, type Report } from "@/lib/mantenimiento-tasks-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search, CalendarIcon, ArrowLeft, ClipboardList, Clock } from "lucide-react"
import { format, isAfter, isBefore, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import NewReportModal from "@/components/mantenimiento/new-report-modal"
import ReportDetailModal from "@/components/mantenimiento/report-detail-modal"
import TaskDetailModal from "@/components/mantenimiento/task-detail-modal"
import CompleteTaskModal from "@/components/mantenimiento/complete-task-modal"
import AddReminderModal from "@/components/mantenimiento/add-reminder-modal"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"

// Corrección de comparación de prioridades
type Priority = "high" | "medium" | "low"
const priorityOrder: Record<Priority, number> = { high: 1, medium: 2, low: 3 }

export default function CondominiumDashboard() {
  const params = useParams()
  const router = useRouter()
  const condominiumId = params.id as string

  // Si aún no está disponible el id, mostrar loading o null
  if (!condominiumId) {
    return <div className="text-center py-10 text-gray-500">Cargando...</div>
  }

  // Extraer el nombre del condominio del ID (asumiendo que el ID es algo como "condo-1")
  const condominiumName = condominiumId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace("Condo", "Condominio")

  const { user, isAuthenticated, isMantenimiento } = useAuthStore()
  const { reports, tasks, updateTask } = useMantenimientoTasksStore()

  // Estados para los modales y filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false)
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isReportDetailModalOpen, setIsReportDetailModalOpen] = useState(false)
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tasks")
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all")
  // Eliminar esta línea:
  // const [reportFilter, setReportFilter] = useState<"all" | "completed">("all")

  useEffect(() => {
    if (!isAuthenticated || !isMantenimiento) {
      router.push("/home")
    }
  }, [isAuthenticated, isMantenimiento, router])

  // Función para verificar si un elemento pertenece al condominio seleccionado
  const belongsToCondominium = (item: Task | Report) => {
    const condoName = condominiumId.replace("condo-", "condominio ").toLowerCase()
    const itemCondo = item.condominium?.toLowerCase() || ""

    return itemCondo.includes(condoName) || itemCondo.includes(condominiumName.toLowerCase())
  }

  // Filtrar tareas por usuario actual y condominio
  const myTasks = user ? tasks.filter((task) => task.assignedTo === user.id && belongsToCondominium(task)) : []

  // Filtrar tareas según el estado seleccionado
  const filteredTasks = myTasks

  // Filtrar reportes por usuario actual y condominio
  const myReports = user
    ? reports.filter((report) => report.mantenimientoId === user.id && belongsToCondominium(report))
    : []

  // Reemplazar esta sección:
  // Filtrar reportes según el estado seleccionado
  // const filteredReports = myReports.filter((report) => {
  //   if (reportFilter === "all") return true
  //   return report.status === "completed"
  // })

  // Por esta versión simplificada:
  const filteredReports = myReports

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: es })
  }

  // Filtrar elementos por búsqueda y fecha
  const getFilteredItems = <T extends Task | Report>(items: T[]) => {
    let filtered = items

    // Filtrar por texto de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)),
      )
    }

    // Filtrar por rango de fechas
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = parseISO(item.createdAt)

        if (dateRange.from && dateRange.to) {
          return isAfter(itemDate, dateRange.from) && isBefore(itemDate, dateRange.to)
        } else if (dateRange.from) {
          return isAfter(itemDate, dateRange.from)
        } else if (dateRange.to) {
          return isBefore(itemDate, dateRange.to)
        }

        return true
      })
    }

    return filtered
  }

  // Obtener tareas filtradas
  const tasksToDisplay = getFilteredItems(filteredTasks).sort((a, b) => {
    // Primero ordenar por estado (pendiente > en progreso > completada)
    const statusOrder = { pending: 0, "in-progress": 1, completed: 2 }
    const statusDiff =
      statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]

    if (statusDiff !== 0) return statusDiff

    // Luego ordenar por prioridad (alta > media > baja)
    return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
  })

  // Obtener reportes filtrados
  const reportsToDisplay = getFilteredItems(filteredReports).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Función para abrir el modal de detalle de reporte
  const openReportDetail = (reportId: string) => {
    setSelectedReport(reportId)
    setIsReportDetailModalOpen(true)
  }

  // Función para abrir el modal de detalle de tarea
  const openTaskDetail = (taskId: string) => {
    setSelectedTask(taskId)
    setIsTaskDetailModalOpen(true)
  }

  // Función para abrir el modal de completar tarea
  const openCompleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el modal de detalle
    setSelectedTask(taskId)
    setIsCompleteModalOpen(true)
  }

  // Función para iniciar una tarea
  const startTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se abra el modal de detalle
    updateTask(taskId, { status: "in-progress" })
  }

  // Función para limpiar los filtros
  const clearFilters = () => {
    setSearchQuery("")
    setDateRange({ from: undefined, to: undefined })
  }

  // Formatear el rango de fechas para mostrar
  const formatDateRangeDisplay = () => {
    if (!dateRange.from && !dateRange.to) return "Filtrar por fecha"

    if (dateRange.from && dateRange.to) {
      if (format(dateRange.from, "dd/MM/yyyy") === format(dateRange.to, "dd/MM/yyyy")) {
        return format(dateRange.from, "dd/MM/yyyy")
      }
      return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
    }

    if (dateRange.from) return `Desde ${format(dateRange.from, "dd/MM/yyyy")}`
    if (dateRange.to) return `Hasta ${format(dateRange.to, "dd/MM/yyyy")}`

    return "Filtrar por fecha"
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isCalendarOpen && !target.closest(".calendar-container")) {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCalendarOpen])

  // Renderizar el indicador de prioridad para las tareas
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Alta
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Media
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Baja
          </Badge>
        )
      default:
        return null
    }
  }

  // Renderizar el indicador de estado para las tareas
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            En progreso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completada
          </Badge>
        )
      default:
        return null
    }
  }

  // Renderizar el indicador de tipo de tarea
  const renderTaskTypeBadge = (task: Task) => {
    if (task.isPersonalReminder) {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          Recordatorio
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.push("/mantenimiento/reportes-condominio")}
          className="mr-3 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-black">Condominio: {condominiumName}</h1>
      </div>

      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="tasks" className="text-sm">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Actividades
          </TabsTrigger>
        </TabsList>

        {/* Contenido de Tareas */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-white text-black border-gray-300 justify-start"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{formatDateRangeDisplay()}</span>
              </Button>

              {isCalendarOpen && (
                <div className="absolute z-50 mt-1 bg-white rounded-md shadow-lg border border-gray-200 calendar-container">
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from || undefined,
                        to: dateRange.to || undefined,
                      }}
                      onSelect={(range) => {
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }}
                      numberOfMonths={1}
                      locale={es}
                    />
                    <div className="flex justify-between mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined })
                          setIsCalendarOpen(false)
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsCalendarOpen(false)}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsAddReminderModalOpen(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Pendientes
            </Button>
          </div>

          {/* Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tareas..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {(searchQuery || dateRange.from || dateRange.to) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-gray-500">
                  Limpiar filtros
                </Button>
              )}

              <span className="text-xs text-gray-500">
                {tasksToDisplay.length} {tasksToDisplay.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>
          </div>

          {/* Lista de tareas */}
          {tasksToDisplay.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
              <ClipboardList className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-semibold mb-2">No hay tareas</h4>
              <p className="text-sm text-gray-500 mb-3">
                {searchQuery || dateRange.from || dateRange.to
                  ? "No se encontraron tareas que coincidan con tus filtros."
                  : `No tienes tareas en ${condominiumName}.`}
              </p>
              {(searchQuery || dateRange.from || dateRange.to) && (
                <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-300" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-16">
              {tasksToDisplay.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border rounded-lg p-4 hover:bg-gray-50 cursor-pointer shadow-sm"
                  onClick={() => openTaskDetail(task.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg text-black">{task.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      {renderStatusBadge(task.status)}
                      {renderPriorityBadge(task.priority)}
                      {renderTaskTypeBadge(task)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    {task.condominium && (
                      <div>
                        <span className="font-medium">Condominio:</span> {task.condominium}
                      </div>
                    )}
                    {task.section && (
                      <div>
                        <span className="font-medium">Sección:</span> {task.section}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Creada: {formatDate(task.createdAt)}</span>
                    <div>
                      {task.status === "pending" ? (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={(e) => startTask(task.id, e)}
                        >
                          Iniciar
                        </Button>
                      ) : task.status === "in-progress" ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={(e) => openCompleteTask(task.id, e)}
                        >
                          Completar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contenido de Actividades */}
        <TabsContent value="reports" className="space-y-4">
          {/* Reemplazar esta sección:
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`${reportFilter === "all" ? "bg-gray-200" : ""}`}
                onClick={() => setReportFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${reportFilter === "completed" ? "bg-green-100" : ""}`}
                onClick={() => setReportFilter("completed")}
              >
                Completadas
              </Button>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsNewReportModalOpen(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nueva Actividad
            </Button>
          </div>

          // Por esta versión simplificada: */}

          {/* Filtros */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 bg-white text-black border-gray-300 justify-start"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{formatDateRangeDisplay()}</span>
              </Button>

              {isCalendarOpen && (
                <div className="absolute z-50 mt-1 bg-white rounded-md shadow-lg border border-gray-200 calendar-container">
                  <div className="p-3">
                    <Calendar
                      mode="range"
                      selected={{
                        from: dateRange.from || undefined,
                        to: dateRange.to || undefined,
                      }}
                      onSelect={(range) => {
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }}
                      numberOfMonths={1}
                      locale={es}
                    />
                    <div className="flex justify-between mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined })
                          setIsCalendarOpen(false)
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setIsCalendarOpen(false)}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                // Generar PDF del condominio actual
                const generatePDF = () => {
                  const doc = new jsPDF()

                  // Configurar fuente y título
                  doc.setFontSize(20)
                  doc.text(`REPORTE DE ACTIVIDADES`, 20, 30)
                  doc.setFontSize(16)
                  doc.text(`${condominiumName.toUpperCase()}`, 20, 45)

                  // Información general
                  doc.setFontSize(12)
                  doc.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 20, 60)
                  doc.text(`Mantenimiento: ${user?.firstName || ""} ${user?.lastName || "N/A"}`, 20, 70)

                  // Resumen
                  doc.setFontSize(14)
                  doc.text("RESUMEN:", 20, 90)
                  doc.setFontSize(12)
                  doc.text(`Total de actividades: ${reportsToDisplay.length}`, 30, 105)
                  doc.text(`Total de tareas: ${tasksToDisplay.length}`, 30, 115)
                  doc.text(`Tareas pendientes: ${tasksToDisplay.filter((t) => t.status === "pending").length}`, 30, 125)
                  doc.text(
                    `Tareas completadas: ${tasksToDisplay.filter((t) => t.status === "completed").length}`,
                    30,
                    135,
                  )

                  // Actividades recientes
                  let yPosition = 155
                  doc.setFontSize(14)
                  doc.text("ACTIVIDADES RECIENTES:", 20, yPosition)
                  yPosition += 15

                  doc.setFontSize(10)
                  reportsToDisplay.slice(0, 8).forEach((report, index) => {
                    if (yPosition > 270) {
                      doc.addPage()
                      yPosition = 20
                    }
                    doc.text(`${index + 1}. ${report.title}`, 30, yPosition)
                    doc.text(`   Fecha: ${formatDate(report.createdAt)}`, 30, yPosition + 8)
                    if (report.section) {
                      doc.text(`   Sección: ${report.section}`, 30, yPosition + 16)
                    }
                    yPosition += 25
                  })

                  // Nueva página para tareas si es necesario
                  if (yPosition > 200) {
                    doc.addPage()
                    yPosition = 20
                  }

                  // Tareas
                  doc.setFontSize(14)
                  doc.text("TAREAS:", 20, yPosition)
                  yPosition += 15

                  doc.setFontSize(10)
                  tasksToDisplay.slice(0, 10).forEach((task, index) => {
                    if (yPosition > 270) {
                      doc.addPage()
                      yPosition = 20
                    }
                    doc.text(`${index + 1}. ${task.title}`, 30, yPosition)
                    doc.text(
                      `   Estado: ${task.status === "pending" ? "Pendiente" : task.status === "in-progress" ? "En progreso" : "Completada"}`,
                      30,
                      yPosition + 8,
                    )
                    doc.text(
                      `   Prioridad: ${task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}`,
                      30,
                      yPosition + 16,
                    )
                    yPosition += 35
                  })

                  // Guardar el PDF
                  doc.save(`reporte-${condominiumId}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
                }

                generatePDF()
              }}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-1" />
              Generar PDF
            </Button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar actividades..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {(searchQuery || dateRange.from || dateRange.to) && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-gray-500">
                  Limpiar filtros
                </Button>
              )}

              <span className="text-xs text-gray-500">
                {reportsToDisplay.length} {reportsToDisplay.length === 1 ? "actividad" : "actividades"}
              </span>
            </div>
          </div>

          {/* Lista de actividades */}
          {reportsToDisplay.length === 0 ? (
            <div className="bg-white border rounded-lg p-6 text-center shadow-sm">
              <FileText className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <h4 className="text-base font-semibold mb-2">No hay actividades</h4>
              <p className="text-sm text-gray-500 mb-3">
                {searchQuery || dateRange.from || dateRange.to
                  ? "No se encontraron actividades que coincidan con tus filtros."
                  : `No has creado ninguna actividad en ${condominiumName}.`}
              </p>
              {(searchQuery || dateRange.from || dateRange.to) && (
                <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-300" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-16">
              {reportsToDisplay.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border rounded-lg p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer shadow-sm"
                  onClick={() => openReportDetail(report.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <h3 className="font-medium text-sm text-black">{report.title}</h3>
                      {report.taskId && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Tarea</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(report.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{report.description}</p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {report.section && <span>Sección: {report.section}</span>}
                    {report.condominium && <span>• {report.condominium}</span>}
                  </div>

                  {/* Mostrar miniaturas si hay imágenes */}
                  {report.images && report.images.length > 0 && (
                    <div className="flex -space-x-2 overflow-hidden mt-2">
                      {report.images.slice(0, 3).map((img, index) => (
                        <div key={index} className="inline-block h-6 w-6 rounded-full border border-white">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Imagen ${index + 1}`}
                            className="h-full w-full object-cover rounded-full"
                          />
                        </div>
                      ))}
                      {report.images.length > 3 && (
                        <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 border border-white text-xs font-medium">
                          +{report.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modales */}
      {/* Modal para nueva actividad */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        preselectedCondominium={condominiumId}
      />

      {/* Modal para agregar recordatorio */}
      <AddReminderModal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        preselectedCondominium={condominiumId}
      />

      {/* Modal de detalle de actividad */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={isReportDetailModalOpen}
          onClose={() => setIsReportDetailModalOpen(false)}
          reportId={selectedReport}
        />
      )}

      {/* Modal de detalle de tarea */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskDetailModalOpen}
          onClose={() => setIsTaskDetailModalOpen(false)}
          taskId={selectedTask}
        />
      )}

      {/* Modal para completar tarea */}
      {selectedTask && (
        <CompleteTaskModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          taskId={selectedTask}
        />
      )}
    </div>
  )
}
