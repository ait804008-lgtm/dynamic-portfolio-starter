"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Blog",
      url: "/dashboard/blog",
      icon: IconFileWord,
    },
    {
      title: "Skills",
      url: "/dashboard/skills",
      icon: IconChartBar,
    },
    {
      title: "Experience",
      url: "/dashboard/experience",
      icon: IconListDetails,
    },
    {
      title: "Education",
      url: "/dashboard/education",
      icon: IconFileDescription,
    },
  ],
  navSecondary: [
    {
      title: "Portfolio",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Public Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Public Blog",
      url: "/blog",
      icon: IconFileWord,
    },
    {
      title: "Contact",
      url: "/contact",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="CodeGuide" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">CodeGuide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} currentPath={pathname} />
        <NavSecondary items={staticData.navSecondary} currentPath={pathname} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
