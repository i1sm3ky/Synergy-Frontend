"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  // TODO: Uncomment these lines when backend is ready
  // const [isAuthenticated, setIsAuthenticated] = useState(false)
  // const [loading, setLoading] = useState(true)
  // const router = useRouter()

  // TODO: Uncomment this useEffect when backend authentication is ready
  // useEffect(() => {
  //   const checkAuth = () => {
  //     if (!AuthService.isAuthenticated()) {
  //       router.push("/login")
  //       return
  //     }
  //     setIsAuthenticated(true)
  //     setLoading(false)
  //   }
  //   checkAuth()
  // }, [router])

  // TODO: Uncomment these loading and auth checks when backend is ready
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  //     </div>
  //   )
  // }

  // if (!isAuthenticated) {
  //   return null
  // }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className={`flex-1 ${!isMobile ? "ml-80" : ""}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="md:hidden -ml-1" /> {/* only visible on mobile */}
        </header>
        <section className="p-6">{children}</section>
      </main>
    </SidebarProvider>
  )
}
