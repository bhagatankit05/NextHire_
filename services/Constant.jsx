import { CalendarHeart, LayoutDashboard, List, Settings, WalletCards } from "lucide-react";

export const SideBarOptions = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: '/dashboard'
    },
    {
        name: "Scheduled Interviews",
        icon: CalendarHeart,
        path: '/scheduled-interviews'
    },
    {
        name: "All Interview",
        icon: List,
        path: '/all-interviews'
    },

    {
        name: "Billing",
        icon: WalletCards,
        path: '/billing'
    },
    {
        name: "Settings",
        icon: Settings,
        path: '/settings'
    },

]