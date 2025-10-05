"use client"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SideBarOptions } from "@/services/Constant"
import { LogOut, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/app/provider"
import { supabase } from "@/services/supabaseClient"
import { toast } from "sonner"
import { useState } from "react"

export function AppSidebar() {
    const path = usePathname();
    const router = useRouter();
    const { user } = useUser?.() || {};
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Failed to sign out');
            setIsSigningOut(false);
            return;
        }
        toast.success('Signed out successfully');
        router.push('/auth');
    };

    return (
        <Sidebar className="bg-white shadow-md border-r border-gray-200">
            <SidebarHeader className="flex flex-col items-center p-4">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={40}
                    className="w-[150px] object-contain mb-6"
                />

                <Link href="/dashboard/create-interview" className="w-full">
                    <Button className="w-full rounded-xl shadow hover:shadow-lg transition-all duration-300">
                        <Plus className="mr-2 h-4 w-4" /> Create New Interview
                    </Button>
                </Link>
            </SidebarHeader>

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

            <SidebarFooter className="p-4 border-t border-gray-200">
                {user && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-3 py-2">
                            {user.picture ? (
                                <Image
                                    src={user.picture}
                                    alt={user.name || 'User'}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                        >
                            <LogOut className="h-4 w-4" />
                            {isSigningOut ? 'Signing out...' : 'Sign Out'}
                        </Button>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
