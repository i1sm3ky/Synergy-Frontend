interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "employer" | "admin";
  department?: string;
  employee_id?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterRequest {
  email: string;
  otp?: string;
  password?: string;
  otp_token?: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  otp_token?: string;
}

interface ResetPasswordRequest {
  email: string;
  token?: string;
  new_password?: string;
}

// TODO: Replace with your actual backend URL
const BACKEND_URL = "http://13.201.77.162:5500";

class AuthService {
  private static TOKEN_KEY = "space_optimizer_token";
  private static USER_KEY = "space_optimizer_user";

  // Existing login method
  static async login(email: string, password: string): Promise<AuthResponse> {
    // TODO: Replace with actual backend endpoint when ready
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      // const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        device_info: {
          device_type: "web",
          browser: navigator.userAgent,
          os: navigator.platform,
          ip_address: "auto-detect",
        },
      }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { access_token } = await response.json();
    this.setToken(access_token);

    const userRes = await this.fetchWithAuth("/auth/me");
    if (!userRes.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user = await userRes.json();

    this.setUser(user);
    return { token: access_token, user };
  }

  // Registration methods
  static async sendRegistrationOTP(email: string): Promise<OTPResponse> {
    if (typeof window === "undefined") {
      throw new Error("Cannot access URL parameters on the server.");
    }

    const params = new URLSearchParams(window.location.search);
    const orgId = params.get("org_id");

    if (!orgId) {
      throw new Error("Invalid registration link! Please try again with a valid link provided.");
    }

    const response = await fetch(`${BACKEND_URL}/auth/register?org_id=${orgId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to send OTP.");
    }

    return data;
  }

  // Step 2: Verify OTP
  static async verifyRegistrationOTP(email: string, otp: string): Promise<OTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    switch (response.status) {
      case 200:
        return {
          success: true,
          message: "OTP verified successfully",
          otp_token: data.otp_token || "", // backend should return this
        };
      case 410:
        throw new Error("⏰ OTP expired. Please request a new one.");
      case 401:
        throw new Error("❌ Invalid OTP. Please check and try again.");
      case 400:
        throw new Error("⚠️ Email and OTP are required.");
      default:
        throw new Error("🚨 Unexpected server error.");
    }
  }

  // Step 3: Complete Registration
  static async completeRegistration(email: string, password: string, otpToken: string): Promise<AuthResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/complete-registration`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, otp_token: otpToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Registration failed.");
    }

    return data; // should match AuthResponse
  }

  // Password reset methods
  static async sendPasswordResetLink(email: string): Promise<OTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send password reset link.");
    }

    return data;
  }

  static async verifyResetToken(token: string): Promise<{ success: boolean; email: string }> {
    const response = await fetch(`${BACKEND_URL}/auth/reset-password/${encodeURIComponent(token)}`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid or expired reset token.");
    }

    // Assume backend returns { email: string }
    return { success: true, email: data.email };
  }

  static async resetPassword(token: string, newPassword: string): Promise<OTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/reset-password/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Password reset failed.");
    }

    return data;
  }

  // Existing methods
  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = "/login";
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async tryRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send HttpOnly refresh cookie
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.access_token) {
        this.setToken(data.access_token);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Token refresh failed:", err);
      return false;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const [, payload] = token.split(".");
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp;
      if (!exp) return true;
      return Date.now() >= exp * 1000;
    } catch (err) {
      console.error("Failed to decode token:", err);
      return true; // assume expired if there's an error
    }
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}, retried = false): Promise<Response> {
    let token = this.getToken();
    url = `${BACKEND_URL}${url}`;

    // Refresh BEFORE sending the request if token is expired
    if (token && this.isTokenExpired(token)) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        token = this.getToken(); // update token
      } else {
        this.logout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    // Only retry once if unauthorized (safety net in case token expired mid-request)
    if (response.status === 401 && !retried) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        return this.fetchWithAuth(url.replace(BACKEND_URL, ""), options, true);
      } else {
        this.logout();
        throw new Error("Unauthorized. Please log in again.");
      }
    }

    return response;
  }
}

export { AuthService, type User, type AuthResponse, type RegisterRequest, type OTPResponse, type ResetPasswordRequest };
