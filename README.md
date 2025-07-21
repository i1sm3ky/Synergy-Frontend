# Space Optimizer Employee Portal

## 🚀 Quick Start (UI Exploration Mode)

The application is currently configured for UI exploration without backend authentication. You can navigate through all screens and interact with the interface using mock data.

## 🔧 Backend Integration Checklist

When you're ready to connect to your backend, follow these steps:

### 1. Environment Variables
Create a `.env.local` file with:
\`\`\`
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url.com
\`\`\`

### 2. Authentication Setup
Uncomment the following files:
- `middleware.ts` - Enable route protection
- `components/protected-layout.tsx` - Enable auth checks
- `components/app-sidebar.tsx` - Enable real user data

### 3. API Endpoints to Implement

#### Authentication
- `POST /api/login` - User login
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, user: User }`

#### Bookings
- `GET /api/my-bookings` - Get user's bookings
- `DELETE /api/bookings/{id}` - Cancel booking

#### Hot Seats
- `GET /api/hot-seats` - Get available hot seats
- `POST /api/book-hot-seat` - Book a hot seat
  - Body: `{ seat: string, start_time: string, end_time: string, purpose: string }`

#### Scheduling
- `POST /api/schedule-workspace` - Schedule workspace
  - Body: `{ required_id: string, workspace_id: string, start_time: string, end_time: string, pattern: string }`

#### Visitor Pass
- `POST /api/visitor-pass` - Create visitor pass
  - Body: `{ visitor_name: string, start_time: string, end_time: string }`

#### Insights
- `GET /api/booking-insights` - Get workspace insights

### 4. Files to Update

Search for "TODO" comments in these files:
- `lib/auth.ts` - Update BACKEND_URL
- `app/page.tsx` - Enable real data fetching
- `app/hot-seat/page.tsx` - Enable booking API
- `app/scheduling/page.tsx` - Enable scheduling API
- `app/visitor-pass/page.tsx` - Enable visitor pass API
- `app/bookings/page.tsx` - Enable bookings API
- `components/protected-layout.tsx` - Enable auth protection
- `components/app-sidebar.tsx` - Enable real user data
- `middleware.ts` - Enable route protection

### 5. Testing Backend Integration

1. Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
2. Uncomment authentication code in `middleware.ts`
3. Uncomment API calls in component files
4. Test login flow at `/login`
5. Verify protected routes redirect to login when not authenticated

## 🎨 Current Features (Mock Data)

- ✅ Complete UI matching Figma designs
- ✅ Responsive sidebar navigation
- ✅ Hot seat booking interface
- ✅ Scheduling system
- ✅ Visitor pass creation
- ✅ Booking management
- ✅ Workspace insights dashboard
- ✅ Mock data for all screens

## 🔄 Ready for Production

Once backend is connected:
- Authentication flow
- Real-time data updates
- Booking confirmations
- Error handling
- Loading states
\`\`\`

</QuickEdit>
