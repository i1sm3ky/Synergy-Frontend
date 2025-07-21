import { type NextRequest, NextResponse } from "next/server"

// Mock user data - replace with actual database
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@company.com",
    password: "password123",
    role: "employee",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@company.com",
    password: "password123",
    role: "employer",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
