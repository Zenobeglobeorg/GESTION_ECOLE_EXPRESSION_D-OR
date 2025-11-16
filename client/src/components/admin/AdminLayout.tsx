import { type ReactNode, useState } from 'react';
import { Navbar } from '../layout/Navbar';
import { SidebarAdmin } from './SidebarAdmin';
import { MobileSidebarAdmin } from './MobileSidebarAdmin';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const AdminLayout = ({ title, subtitle, actions, children }: AdminLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-yellow-50">
      <SidebarAdmin
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <MobileSidebarAdmin
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <Navbar onMenuClick={() => setIsMobileMenuOpen((prev) => !prev)} />

      <main
        className={`pt-20 pb-10 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-72'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-400 to-yellow-500 text-blue-900 font-semibold flex items-center justify-center shadow-md">
                    Admin
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900 leading-tight">{title}</h1>
                    {subtitle && <p className="text-blue-700/80 text-sm mt-1">{subtitle}</p>}
                  </div>
                </div>
              </div>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-8">{children}</section>
        </div>
      </main>
    </div>
  );
};


