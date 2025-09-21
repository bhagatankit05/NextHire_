
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { AppSidebar } from './_components/AppSidebar';


const DashboardProvider = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
};

export default DashboardProvider;