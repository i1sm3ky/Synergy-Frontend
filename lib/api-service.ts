import {
  type HotSeatResponse,
  type HotSeatBookingRequest,
  type HotSeatBookingResponse,
  type VisitorPassRequest,
  type VisitorPassResponse,
  type AvailableSlotsResponse,
  type ScheduleRequest,
  type ScheduleResponse,
  type ConflictResponse,
  type ConflictResolutionRequest,
  type ConflictResolutionResponse,
  type HealthResponse,
  type WFHResponse,
  type Employee,
  type Workspace,
  type OccupancyReport,
  type APIResponse,
  isValidWorkspaceId,
  isValidEmployeeId,
  isValidISODateTime,
} from "@/types/api-interfaces"

// TODO: Replace with your actual backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

class APIService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.detail || data.message || "Request failed",
            details: data,
            timestamp: new Date().toISOString(),
          },
        }
      }

      return {
        success: true,
        data,
        metadata: {
          request_id: response.headers.get("x-request-id") || "unknown",
          processing_time_ms: Number.parseInt(response.headers.get("x-processing-time") || "0"),
          rate_limit: {
            remaining: Number.parseInt(response.headers.get("x-ratelimit-remaining") || "100"),
            reset_time: response.headers.get("x-ratelimit-reset") || new Date().toISOString(),
          },
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network request failed",
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  // ===================================
  // HOT SEAT MANAGEMENT
  // ===================================

  static async getHotSeats(): Promise<APIResponse<HotSeatResponse>> {
    return this.request<HotSeatResponse>("/getHotSeat")
  }

  static async bookHotSeat(request: HotSeatBookingRequest): Promise<APIResponse<HotSeatBookingResponse>> {
    // Validate input parameters
    if (!isValidWorkspaceId(request.workspace_id)) {
      return {
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Workspace ID must follow format: WH001, WS001, etc.",
          timestamp: new Date().toISOString(),
        },
      }
    }

    if (!isValidISODateTime(request.start_time) || !isValidISODateTime(request.end_time)) {
      return {
        success: false,
        error: {
          code: "INVALID_DATETIME",
          message: "Datetime must be in ISO 8601 format: 2024-06-02T09:00:00Z",
          timestamp: new Date().toISOString(),
        },
      }
    }

    if (!request.purpose.trim()) {
      return {
        success: false,
        error: {
          code: "MISSING_PURPOSE",
          message: "Purpose is required for booking",
          timestamp: new Date().toISOString(),
        },
      }
    }

    return this.request<HotSeatBookingResponse>("/getHotSeat/book", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // ===================================
  // VISITOR PASS MANAGEMENT
  // ===================================

  static async createVisitorPass(request: VisitorPassRequest): Promise<APIResponse<VisitorPassResponse>> {
    // Validate visitor data
    for (const visitor of request.visitors) {
      if (!visitor.name.trim()) {
        return {
          success: false,
          error: {
            code: "INVALID_VISITOR_NAME",
            message: "Visitor name is required",
            timestamp: new Date().toISOString(),
          },
        }
      }

      if (!/^\d{10}$/.test(visitor.phone)) {
        return {
          success: false,
          error: {
            code: "INVALID_PHONE",
            message: "Phone number must be 10 digits",
            timestamp: new Date().toISOString(),
          },
        }
      }

      if (!isValidISODateTime(visitor.in_time) || !isValidISODateTime(visitor.out_time)) {
        return {
          success: false,
          error: {
            code: "INVALID_DATETIME",
            message: "Visit times must be in ISO 8601 format",
            timestamp: new Date().toISOString(),
          },
        }
      }
    }

    return this.request<VisitorPassResponse>("/getVisitorPass", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // ===================================
  // SCHEDULING & AVAILABILITY
  // ===================================

  static async getAvailableSlots(): Promise<APIResponse<AvailableSlotsResponse>> {
    return this.request<AvailableSlotsResponse>("/availableSlots")
  }

  static async createSchedule(request: ScheduleRequest): Promise<APIResponse<ScheduleResponse>> {
    // Validate schedule request
    if (!isValidWorkspaceId(request.workspace_id)) {
      return {
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID format",
          timestamp: new Date().toISOString(),
        },
      }
    }

    if (!["one-time", "daily", "weekly", "monthly"].includes(request.booking_pattern)) {
      return {
        success: false,
        error: {
          code: "INVALID_BOOKING_PATTERN",
          message: "Booking pattern must be one of: one-time, daily, weekly, monthly",
          timestamp: new Date().toISOString(),
        },
      }
    }

    return this.request<ScheduleResponse>("/availableSlots/schedule", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // ===================================
  // CONFLICT MANAGEMENT
  // ===================================

  static async getConflicts(): Promise<APIResponse<ConflictResponse>> {
    return this.request<ConflictResponse>("/sync/conflicts")
  }

  static async resolveConflict(
    conflictId: string,
    request: ConflictResolutionRequest,
  ): Promise<APIResponse<ConflictResolutionResponse>> {
    if (!conflictId.trim()) {
      return {
        success: false,
        error: {
          code: "INVALID_CONFLICT_ID",
          message: "Conflict ID is required",
          timestamp: new Date().toISOString(),
        },
      }
    }

    const validActions = ["cancel_booking", "reassign_workspace", "modify_time", "escalate"]
    if (!validActions.includes(request.action)) {
      return {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: `Action must be one of: ${validActions.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
      }
    }

    return this.request<ConflictResolutionResponse>(`/sync/conflicts/${conflictId}/resolve`, {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // ===================================
  // SYSTEM OPERATIONS
  // ===================================

  static async markWFH(): Promise<APIResponse<WFHResponse>> {
    return this.request<WFHResponse>("/mark_wfh_tomorrow", {
      method: "POST",
    })
  }

  static async healthCheck(): Promise<APIResponse<HealthResponse>> {
    return this.request<HealthResponse>("/health")
  }

  // ===================================
  // ADMIN OPERATIONS
  // ===================================

  static async getEmployees(): Promise<APIResponse<{ employees: Employee[] }>> {
    return this.request<{ employees: Employee[] }>("/employees")
  }

  static async getWorkspaces(): Promise<APIResponse<{ workspaces: Workspace[] }>> {
    return this.request<{ workspaces: Workspace[] }>("/workspaces")
  }

  static async getOccupancyReport(date: string): Promise<APIResponse<OccupancyReport>> {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: {
          code: "INVALID_DATE_FORMAT",
          message: "Date must be in YYYY-MM-DD format",
          timestamp: new Date().toISOString(),
        },
      }
    }

    return this.request<OccupancyReport>(`/reports/occupancy?date=${date}`)
  }

  // ===================================
  // WEBSOCKET CONNECTION
  // ===================================

  static createWebSocketConnection(employeeId: string): WebSocket | null {
    if (!isValidEmployeeId(employeeId)) {
      console.error("Invalid employee ID format for WebSocket connection")
      return null
    }

    try {
      const wsUrl = BACKEND_URL.replace("http", "ws")
      return new WebSocket(`${wsUrl}/ws/${employeeId}`)
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      return null
    }
  }
}

export { APIService }
