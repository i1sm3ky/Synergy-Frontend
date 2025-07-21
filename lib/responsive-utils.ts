"use client"

import { useState, useEffect } from "react"

// Breakpoint values matching Tailwind CSS defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook to detect current screen size and breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("sm")
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const updateBreakpoint = () => {
      const currentWidth = window.innerWidth
      setWidth(currentWidth)

      if (currentWidth >= BREAKPOINTS["2xl"]) {
        setBreakpoint("2xl")
      } else if (currentWidth >= BREAKPOINTS.xl) {
        setBreakpoint("xl")
      } else if (currentWidth >= BREAKPOINTS.lg) {
        setBreakpoint("lg")
      } else if (currentWidth >= BREAKPOINTS.md) {
        setBreakpoint("md")
      } else if (currentWidth >= BREAKPOINTS.sm) {
        setBreakpoint("sm")
      } else {
        setBreakpoint("sm")
      }
    }

    updateBreakpoint()
    window.addEventListener("resize", updateBreakpoint)
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  return { breakpoint, width }
}

/**
 * Hook to detect if current screen is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

/**
 * Hook to detect if current screen is desktop
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.md)
    }

    checkIsDesktop()
    window.addEventListener("resize", checkIsDesktop)
    return () => window.removeEventListener("resize", checkIsDesktop)
  }, [])

  return isDesktop
}

/**
 * Utility function to get responsive classes based on breakpoint
 */
export function getResponsiveClasses(
  classes: Partial<Record<Breakpoint | "base", string>>,
  currentBreakpoint: Breakpoint,
): string {
  const orderedBreakpoints: (Breakpoint | "base")[] = ["base", "sm", "md", "lg", "xl", "2xl"]
  let applicableClass = classes.base || ""

  for (const bp of orderedBreakpoints) {
    if (bp === "base") continue
    if (BREAKPOINTS[currentBreakpoint] >= BREAKPOINTS[bp] && classes[bp]) {
      applicableClass = classes[bp] || applicableClass
    }
  }

  return applicableClass
}

/**
 * Hook for managing sidebar state across different screen sizes
 */
export function useSidebarState() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  // Auto-close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false)
    }
  }, [isMobile])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobile, isMobileMenuOpen])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return {
    isMobile,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    setIsMobileMenuOpen,
  }
}
