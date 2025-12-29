"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

export function DashboardHeader() {
  const pathname = usePathname()
  
  // Split pathname into segments, filter empty
  const segments = pathname.split("/").filter(Boolean)
  
  // Map segments to readable titles (simple capitalization for now)
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1
    
    // Smart Title: If looks like ID (long alphanumeric), truncate it
    let title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    if (segment.length > 20 && /\d/.test(segment)) {
        title = `${segment.slice(0, 5)}...${segment.slice(-4)}`
    }
    
    return { href, title, isLast }
  })

  // Always start with Home? Or just show current path.
  // Let's add Home.
  const items = [
      { href: "/", title: "Dashboard", isLast: segments.length === 0 },
      ...breadcrumbs
  ]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
             {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
             <BreadcrumbItem className={index === 0 && segments.length > 0 ? "hidden md:flex" : ""}>
                {item.isLast ? (
                     <BreadcrumbPage>{item.title}</BreadcrumbPage>
                ) : (
                    <BreadcrumbLink href={item.href}>
                        {item.title}
                    </BreadcrumbLink>
                )}
             </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
