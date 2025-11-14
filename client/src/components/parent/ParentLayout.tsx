import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarParent } from '../../components/parent/SidebarParent';
import { MobileSidebarParent } from '../../components/parent/MobileSidebarParent';
import { ParentHeader } from '../../components/parent/ParentHeader';

export const ParentLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // AJOUT: dark:bg-gray-900 pour le fond sombre général
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <SidebarParent isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <MobileSidebarParent isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <ParentHeader isSidebarCollapsed={isSidebarCollapsed} />

      <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};