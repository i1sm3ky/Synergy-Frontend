# Enhanced Authentication API Documentation

## 🔐 Security Best Practices Implemented

### Password Security
- **Hashing**: bcrypt with salt rounds ≥ 12
- **Strength Requirements**: 
  - Minimum 8 characters
  - Uppercase + lowercase letters
  - Numbers + special characters
  - No common passwords (dictionary check)

### OTP Security
- **Generation**: Cryptographically secure random 6-digit codes
- **Expiration**: 10 minutes from generation
- **Rate Limiting**: Max 3 attempts per 15 minutes per email
- **Single Use**: OTPs invalidated after successful verification

### Token Security
- **JWT**: RS256 algorithm with rotating keys
- **Expiration**: Access tokens (1 hour), Refresh tokens (7 days)
- **Reset Tokens**: UUID v4 with 1-hour expiration
- **Storage**: Secure HTTP-only cookies for sensitive tokens

## 📊 Database Schema Changes

### Users Table Enhancement
\`\`\`sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires_at TIMESTAMP NULL,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email_verified ON users(email, email_verified);
CREATE INDEX idx_users_reset_token ON users(password_reset_token);
\`\`\`

### OTP Verification Table
\`\`\`sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  otp_type ENUM('registration', 'password_reset', 'login_2fa') NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_otp_email_type (email, otp_type),
  INDEX idx_otp_expires (expires_at)
);
\`\`\`

### Audit Log Table
\`\`\`sql
CREATE TABLE auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  email VARCHAR(255) NOT NULL,
  action ENUM('login', 'logout', 'register', 'password_reset', 'otp_sent', 'otp_verified') NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_audit_user_action (user_id, action),
  INDEX idx_audit_email_action (email, action),
  INDEX idx_audit_created (created_at)
);
\`\`\`

## 🔗 Enhanced API Endpoints

### 1. User Registration Flow

#### Send Registration OTP
**Endpoint:** \`POST /api/v1/auth/register/send-otp\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "user_type": "employee"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "otp_token": "otp_reg_abc123def456",
    "expires_in": 600,
    "message": "OTP sent to your email address"
  },
  "rate_limit": {
    "remaining_attempts": 2,
    "reset_time": "2025-01-07T10:45:00Z"
  }
}
\`\`\`

**Error Responses:**
\`\`\`json
// Rate Limited (429)
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many OTP requests. Please wait before trying again.",
    "retry_after": 900
  }
}

// Invalid Email Domain (400)
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL_DOMAIN",
    "message": "Email domain not authorized for registration",
    "allowed_domains": ["company.com", "subsidiary.com"]
  }
}
\`\`\`

#### Verify Registration OTP
**Endpoint:** \`POST /api/v1/auth/register/verify-otp\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "otp": "123456",
  "otp_token": "otp_reg_abc123def456"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "verification_token": "verify_xyz789abc123",
    "expires_in": 1800,
    "message": "OTP verified successfully. You can now set your password."
  }
}
\`\`\`

#### Complete Registration
**Endpoint:** \`POST /api/v1/auth/register/complete\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "verification_token": "verify_xyz789abc123",
  "profile_data": {
    "first_name": "John",
    "last_name": "Doe",
    "department": "Engineering",
    "employee_id": "EMP001"
  }
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "email": "john.doe@company.com",
      "name": "John Doe",
      "department": "Engineering",
      "employee_id": "EMP001",
      "role": "employee",
      "email_verified": true,
      "created_at": "2025-01-07T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
  },
  "message": "Registration completed successfully"
}
\`\`\`

### 2. Password Reset Flow

#### Send Password Reset Link
**Endpoint:** \`POST /api/v1/auth/forgot-password\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "message": "If an account with this email exists, a password reset link has been sent.",
    "reset_token_hint": "abc***def",
    "expires_in": 3600
  }
}
\`\`\`

#### Verify Reset Token
**Endpoint:** \`POST /api/v1/auth/verify-reset-token\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "token": "reset_token_abc123def456"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "token_valid": true,
    "user_info": {
      "email": "john.doe@company.com",
      "name": "John Doe"
    },
    "expires_in": 2400,
    "message": "Reset token is valid. You can now set a new password."
  }
}
\`\`\`

#### Reset Password
**Endpoint:** \`POST /api/v1/auth/reset-password\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "token": "reset_token_abc123def456",
  "new_password": "NewSecurePass123!"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "message": "Password reset successfully",
    "user_info": {
      "email": "john.doe@company.com",
      "name": "John Doe",
      "last_password_change": "2025-01-07T10:30:00Z"
    },
    "security_actions": {
      "all_sessions_invalidated": true,
      "login_required": true
    }
  }
}
\`\`\`

### 3. Enhanced Login with Security Features

#### Login with Rate Limiting
**Endpoint:** \`POST /api/v1/auth/login\`

**Request Body:**
\`\`\`json
{
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "device_info": {
    "device_type": "web",
    "browser": "Chrome 120.0",
    "os": "Windows 10",
    "ip_address": "192.168.1.100"
  },
  "remember_me": false
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "user_123456",
      "employee_id": "EMP001",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "role": "employee",
      "permissions": [
        "book_hot_seat",
        "schedule_workspace",
        "create_visitor_pass",
        "raise_conflict"
      ],
      "profile_picture": "https://cdn.company.com/profiles/john_doe.jpg",
      "last_login": "2025-01-07T10:30:00Z"
    },
    "security_info": {
      "password_expires_in_days": 90,
      "requires_password_change": false,
      "two_factor_enabled": false
    }
  },
  "message": "Login successful"
}
\`\`\`

**Error Responses:**
\`\`\`json
// Account Locked (423)
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to multiple failed login attempts",
    "locked_until": "2025-01-07T11:00:00Z",
    "unlock_options": [
      "wait_for_timeout",
      "contact_admin",
      "password_reset"
    ]
  }
}

// Invalid Credentials (401)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "remaining_attempts": 2,
    "lockout_warning": "Account will be locked after 3 failed attempts"
  }
}
\`\`\`

## 🔄 Data Flow Integration

### Registration Flow Data Transformation
1. **Email Validation** → Domain whitelist check → Employee directory lookup
2. **OTP Generation** → Secure random generation → Email template rendering → SMTP delivery
3. **OTP Verification** → Rate limit check → Code validation → Temporary token generation
4. **Password Creation** → Strength validation → bcrypt hashing → User record creation
5. **Auto-Login** → JWT generation → Session creation → Dashboard redirect

### Password Reset Flow Data Transformation
1. **Email Lookup** → User existence check → Reset token generation → Email delivery
2. **Token Verification** → Expiration check → Token validation → User context loading
3. **Password Update** → Strength validation → bcrypt hashing → Session invalidation
4. **Security Actions** → All user sessions terminated → Audit log creation → Email notification

### Security Monitoring Data Flow
1. **Login Attempts** → IP tracking → Geolocation lookup → Risk scoring
2. **Failed Attempts** → Counter increment → Threshold checking → Account locking
3. **Suspicious Activity** → Pattern detection → Admin notification → Security logging
4. **Audit Trail** → Action logging → Compliance reporting → Security analytics

## 🛡️ Validation Rules & Error Handling

### Email Validation
\`\`\`typescript
interface EmailValidationRules {
  format: RegExp // RFC 5322 compliant
  maxLength: 254
  allowedDomains: string[] // Company domains only
  blockedDomains: string[] // Public email providers
  requireMX: boolean // MX record verification
}
\`\`\`

### Password Validation
\`\`\`typescript
interface PasswordValidationRules {
  minLength: 8
  maxLength: 128
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  forbiddenPatterns: RegExp[] // Common passwords, keyboard patterns
  historyCheck: number // Last 5 passwords
  expirationDays: 90
}
\`\`\`

### OTP Validation
\`\`\`typescript
interface OTPValidationRules {
  length: 6
  type: 'numeric'
  expirationMinutes: 10
  maxAttempts: 3
  rateLimitWindow: 15 // minutes
  maxRequestsPerWindow: 3
}
\`\`\`

## 🚨 Error Handling Strategy

### Client-Side Error Handling
\`\`\`typescript
interface AuthError {
  code: string
  message: string
  field?: string
  suggestions?: string[]
  retryable: boolean
  retryAfter?: number
}

// Error Categories
enum AuthErrorCodes {
  // Validation Errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // OTP Errors
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_RATE_LIMITED = 'OTP_RATE_LIMITED',
  
  // Token Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // System Errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED'
}
\`\`\`

### Server-Side Error Responses
\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "password",
        "code": "WEAK_PASSWORD",
        "message": "Password must contain at least one uppercase letter",
        "current_strength": "medium"
      }
    ],
    "suggestions": [
      "Add uppercase letters to strengthen password",
      "Consider using a password manager"
    ]
  },
  "request_id": "req_abc123def456",
  "timestamp": "2025-01-07T10:30:00Z"
}
\`\`\`

## 📧 Email Templates

### Registration OTP Email
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Space Optimizer - Verify Your Email</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Space Optimizer</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
            <h2>Verify Your Email Address</h2>
            <p>Welcome to Space Optimizer! Please use the following code to verify your email address:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">
                    {{OTP_CODE}}
                </div>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this verification, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
                This email was sent to {{EMAIL_ADDRESS}}. 
                If you have questions, contact IT support at support@company.com
            </p>
        </div>
    </div>
</body>
</html>
\`\`\`

### Password Reset Email
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Space Optimizer - Password Reset</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Space Optimizer</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
            <h2>Reset Your Password</h2>
            <p>Hello {{USER_NAME}},</p>
            <p>We received a request to reset your password. Use the token below to reset your password:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #f97316;">
                    {{RESET_TOKEN}}
                </div>
            </div>
            
            <p><strong>This token will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email and contact IT support immediately.</p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;">
                    <strong>Security Tip:</strong> Never share your reset token with anyone. 
                    Our support team will never ask for your password or reset token.
                </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
                This email was sent to {{EMAIL_ADDRESS}} from IP {{IP_ADDRESS}}. 
                If this wasn't you, contact IT support immediately at support@company.com
            </p>
        </div>
    </div>
</body>
</html>
\`\`\`

## 🔒 Security Headers & Configuration

### Required Security Headers
\`\`\`typescript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
\`\`\`

### Rate Limiting Configuration
\`\`\`typescript
const rateLimits = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    skipSuccessfulRequests: true
  },
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    skipSuccessfulRequests: true
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset attempts per hour
    skipSuccessfulRequests: false
  },
  otpRequest: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 OTP requests per window
    skipSuccessfulRequests: false
  }
}
\`\`\`

This comprehensive authentication system provides enterprise-grade security while maintaining excellent user experience. The floating chat bot enhances user support throughout the authentication process, and all features are designed to integrate seamlessly with the existing Space Optimizer Employee Portal.
