"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  currentPath,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
  currentPath?: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()
  const activePath = currentPath || pathname

  const isActive = (url: string) => {
    if (url === "/") {
      return activePath === url
    }
    return activePath.startsWith(url)
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
