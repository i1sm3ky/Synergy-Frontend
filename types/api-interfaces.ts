// ===================================
// CORE DATA STRUCTURES
// ===================================

export interface Employee {
  employee_id: string
  name: string
  email: string
  role: "Employee" | "Admin"
  team: string
}

export interface Workspace {
  workspace_id: string
  workspace_type: "Hot Seats" | "Work Station" | "Discussion Room" | "Conference Room"
  level: string
  capacity?: number
  status: "available" | "booked" | "in_use" | "partially_booked"
  occupant?: string | null
}

export interface TimeSlot {
  start: string // ISO 8601 format
  end: string // ISO 8601 format
}

export interface Booking {
  booking_id?: string
  workspace_id: string
  workspace_type: string
  employee_name?: string
  team?: string
  start_time: string // ISO 8601 format
  end_time: string // ISO 8601 format
  purpose: string
  booking_pattern?: "one-time" | "daily" | "weekly" | "monthly"
  status?: "confirmed" | "pending" | "cancelled"
}

// ===================================
// HOT SEAT MANAGEMENT
// ===================================

export interface HotSeat {
  workspace_id: string
  level: string
  status: "available" | "booked" | "in_use"
  booked_by: string | null
  team: string | null
  time_slot: string | null
}

export interface HotSeatResponse {
  hot_seats: HotSeat[]
  available_seats: string[]
  floor_occupancy: Record<string, number>
  current_bookings: Booking[]
  team_members_same_floor: number
}

export interface HotSeatBookingRequest {
  workspace_id: string
  start_time: string // ISO 8601 format: "2024-06-02T09:00:00Z"
  end_time: string // ISO 8601 format: "2024-06-02T12:00:00Z"
  purpose: string
}

export interface HotSeatBookingResponse {
  message: string
  booking_id?: string
  detail?: string // For conflict scenarios
}

// ===================================
// VISITOR PASS MANAGEMENT
// ===================================

export interface VisitorInfo {
  name: string
  phone: string // Format: "1234567890"
  address: string
  photo: string // Base64 encoded image
  in_time: string // ISO 8601 format
  out_time: string // ISO 8601 format
}

export interface VisitorPassRequest {
  visitors: VisitorInfo[]
}

export interface VisitorPass {
  guest_id: string
  visitor_name: string
  qr_code: string // Base64 encoded QR code
  valid_from: string // ISO 8601 format
  valid_until: string // ISO 8601 format
}

export interface VisitorPassResponse {
  visitor_passes: VisitorPass[]
}

// ===================================
// SCHEDULING & AVAILABILITY
// ===================================

export interface AvailableSlot {
  workspace_id: string
  workspace_type: string
  level: string
  status: "available" | "partially_booked" | "booked"
  available_times: TimeSlot[]
  bookings: Array<{
    employee_name: string
    team: string
    start_time: string
    end_time: string
    purpose: string
  }>
}

export interface Schedule {
  employee_name: string
  workspace_id: string
  start_time: string
  end_time: string
  booking_pattern: "one-time" | "daily" | "weekly" | "monthly"
}

export interface AvailableSlotsResponse {
  available_slots: AvailableSlot[]
  schedules: Schedule[]
}

export interface ScheduleRequest {
  workspace_id: string
  start_time: string // ISO 8601 format
  end_time: string // ISO 8601 format
  booking_pattern: "one-time" | "daily" | "weekly" | "monthly"
}

export interface ScheduleResponse {
  message: string
  schedule_id: string
}

// ===================================
// CONFLICT MANAGEMENT
// ===================================

export interface Conflict {
  id: string
  workspace_id: string
  workspace_type: string
  conflict: string
  raiser_name: string
  user_name: string
  status: "Pending" | "Resolved" | "Rejected"
  timestamp: string // ISO 8601 format
}

export interface ConflictResponse {
  conflicts: Conflict[]
}

export interface ConflictResolutionRequest {
  action: "cancel_booking" | "reassign_workspace" | "modify_time" | "escalate"
  alternative_workspace_id?: string
  new_time_slot?: TimeSlot
  notes?: string
}

export interface ConflictResolutionResponse {
  message: string
  resolution_details?: {
    action_taken: string
    new_workspace_id?: string
    new_time_slot?: TimeSlot
  }
}

// ===================================
// REAL-TIME UPDATES
// ===================================

export interface WebSocketMessage {
  type: "workspace_update" | "booking_notification" | "conflict_alert" | "system_message"
  data: any
  timestamp: string
}

export interface WorkspaceUpdate {
  workspace_id: string
  status: "available" | "booked" | "in_use"
  timestamp: string
  occupant?: string
  booking_details?: Partial<Booking>
}

// ===================================
// REPORTING & ANALYTICS
// ===================================

export interface OccupancyData {
  workspace_type: string
  level: string
  total_bookings: number
  total_hours: number
  utilization_percentage?: number
}

export interface OccupancyReport {
  date: string // Format: "2024-06-01"
  occupancy: OccupancyData[]
  summary?: {
    total_workspaces: number
    total_bookings: number
    average_utilization: number
    peak_hours: string[]
  }
}

// ===================================
// SYSTEM HEALTH & STATUS
// ===================================

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  services?: {
    database: "up" | "down"
    websocket: "up" | "down"
    external_apis: "up" | "down"
  }
}

export interface WFHResponse {
  message: string
  date: string
  employee_id: string
}

// ===================================
// API ENDPOINT CONFIGURATIONS
// ===================================

export interface APIEndpoints {
  // Hot Seat Management
  getHotSeats: {
    method: "GET"
    path: "/getHotSeat"
    response: HotSeatResponse
  }
  bookHotSeat: {
    method: "POST"
    path: "/getHotSeat/book"
    request: HotSeatBookingRequest
    response: HotSeatBookingResponse
  }

  // Visitor Management
  createVisitorPass: {
    method: "POST"
    path: "/getVisitorPass"
    request: VisitorPassRequest
    response: VisitorPassResponse
  }

  // Scheduling
  getAvailableSlots: {
    method: "GET"
    path: "/availableSlots"
    response: AvailableSlotsResponse
  }
  createSchedule: {
    method: "POST"
    path: "/availableSlots/schedule"
    request: ScheduleRequest
    response: ScheduleResponse
  }

  // Conflict Management
  getConflicts: {
    method: "GET"
    path: "/sync/conflicts"
    response: ConflictResponse
  }
  resolveConflict: {
    method: "POST"
    path: "/sync/conflicts/{conflict_id}/resolve"
    request: ConflictResolutionRequest
    response: ConflictResolutionResponse
  }

  // System Operations
  markWFH: {
    method: "POST"
    path: "/mark_wfh_tomorrow"
    response: WFHResponse
  }
  healthCheck: {
    method: "GET"
    path: "/health"
    response: HealthResponse
  }

  // Admin Operations
  getEmployees: {
    method: "GET"
    path: "/employees"
    response: { employees: Employee[] }
  }
  getWorkspaces: {
    method: "GET"
    path: "/workspaces"
    response: { workspaces: Workspace[] }
  }
  getOccupancyReport: {
    method: "GET"
    path: "/reports/occupancy"
    query: { date: string }
    response: OccupancyReport
  }
}

// ===================================
// VALIDATION SCHEMAS
// ===================================

export const ValidationRules = {
  employee_id: {
    pattern: /^[A-Z]{3}\d{3}$/, // Format: DEL127
    required: true,
  },
  workspace_id: {
    pattern: /^(WH|WS|DR|CR)\d{3}$/, // Format: WH001, WS001, DR001, CR001
    required: true,
  },
  phone: {
    pattern: /^\d{10}$/, // 10-digit phone number
    required: true,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  },
  iso_datetime: {
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    required: true,
  },
  level: {
    pattern: /^\d{2}$/, // Format: 01, 02, 03
    required: true,
  },
} as const

// ===================================
// ERROR HANDLING
// ===================================

export interface APIError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  metadata?: {
    request_id: string
    processing_time_ms: number
    rate_limit?: {
      remaining: number
      reset_time: string
    }
  }
}

// ===================================
// UTILITY TYPES
// ===================================

export type WorkspaceStatus = "available" | "booked" | "in_use" | "partially_booked"
export type BookingPattern = "one-time" | "daily" | "weekly" | "monthly"
export type ConflictStatus = "Pending" | "Resolved" | "Rejected"
export type UserRole = "Employee" | "Admin"
export type WorkspaceType = "Hot Seats" | "Work Station" | "Discussion Room" | "Conference Room"

// Type guards for runtime validation
export const isValidWorkspaceId = (id: string): boolean => ValidationRules.workspace_id.pattern.test(id)

export const isValidEmployeeId = (id: string): boolean => ValidationRules.employee_id.pattern.test(id)

export const isValidISODateTime = (datetime: string): boolean => ValidationRules.iso_datetime.pattern.test(datetime)

export const isValidLevel = (level: string): boolean => ValidationRules.level.pattern.test(level)
