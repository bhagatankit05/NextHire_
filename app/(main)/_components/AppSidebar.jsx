"use client"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SideBarOptions } from "@/services/Constant"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const path = usePathname();

    return (
        <Sidebar className="bg-white shadow-md border-r border-gray-200">
            {/* Header */}
            <SidebarHeader className="flex flex-col items-center p-4">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={40}
                    className="w-[150px] object-contain mb-6"
                />

                <Button className="w-full rounded-xl shadow hover:shadow-lg transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" /> Create New Interview
                </Button>
            </SidebarHeader>

            {/* Menu */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="space-y-2 px-3">
                        {SideBarOptions.map((option, index) => {
                            const isActive = path === option.path;

                            return (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={option.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group
                                                ${isActive
                                                    ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                                }`}
                                        >
                                            <option.icon
                                                className={`h-5 w-5 transition-colors duration-300 
                                                    ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}
                                                `}
                                            />
                                            <span className="text-[15px] font-medium leading-6">{option.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
