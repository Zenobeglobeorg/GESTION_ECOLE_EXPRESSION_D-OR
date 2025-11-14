import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const mockChildren = [
  { id: 1, name: 'Aminata Diop', class: 'CM1 A', avatar: 'A' },
  { id: 2, name: 'Ibrahima Diop', class: 'CE2 B', avatar: 'I' },
];

interface ParentHeaderProps {
  isSidebarCollapsed: boolean; 
}

export const ParentHeader = ({ isSidebarCollapsed }: ParentHeaderProps) => {
  const { user } = useAuth(); 
  const [selectedChild, setSelectedChild] = useState(mockChildren[0]);
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  
  const handleSelectChild = (child: typeof mockChildren[0]) => {
    setSelectedChild(child);
    setIsChildDropdownOpen(false);
  };

  return (
    // AJOUT: dark:bg-gray-800 dark:border-gray-700
    <header className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ${
      isSidebarCollapsed ? 'lg:left-28' : 'lg:left-64'
    } left-0`}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        <div className="hidden lg:block">
          {/* AJOUT: dark:text-blue-400 */}
          <p className="text-md font-semibold text-blue-800 dark:text-blue-400">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Espace Parent</p>
        </div>

        <div className="lg:hidden">
          <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
            Expression d'Or
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
            // AJOUT: dark:hover:bg-gray-700
            className="flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg transition-colors hover:bg-yellow-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm md:text-base">
              {selectedChild.avatar}
            </div>
            <div className="text-left hidden md:block">
              {/* AJOUT: dark:text-white */}
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{selectedChild.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{selectedChild.class}</p>
            </div>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isChildDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isChildDropdownOpen && (
            // AJOUT: dark:bg-gray-800 dark:border-gray-700
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
              <p className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Changer d'enfant</p>
              <div className="p-2">
                {mockChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child)}
                    // AJOUT: dark:hover:bg-gray-700
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-yellow-100 dark:hover:bg-gray-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                      {child.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{child.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};