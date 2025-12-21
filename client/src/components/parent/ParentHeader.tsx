import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSelectedChild } from '../../contexts/SelectedChildContext';
import * as studentService from '../../services/studentService';

interface ParentHeaderProps {
  isSidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export const ParentHeader = ({ isSidebarCollapsed, onMobileMenuToggle }: ParentHeaderProps) => {
  const { user } = useAuth();
  const { selectedChild, setSelectedChild, children, setChildren, setLoading } = useSelectedChild();
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  
  // Charger les enfants du parent connecté
  useEffect(() => {
    const loadChildren = async () => {
      if (!user || user.role !== 'PARENT') return;
      
      try {
        setLoading(true);
        const students = await studentService.getStudentsByParent(user.id);
        setChildren(students);
        
        // Sélectionner le premier enfant par défaut s'il n'y en a pas de sélectionné
        if (students.length > 0 && !selectedChild) {
          setSelectedChild(students[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des enfants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChildren();
  }, [user, setChildren, setSelectedChild, setLoading, selectedChild]);
  
  const handleSelectChild = (child: studentService.Student) => {
    setSelectedChild(child);
    setIsChildDropdownOpen(false);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            aria-label="Ouvrir le menu"
            title="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-blue-700 dark:text-blue-400">
            Expression d'Or
          </h1>
        </div>

        <div className="relative">
          {selectedChild ? (
            <>
              <button
                onClick={() => setIsChildDropdownOpen(!isChildDropdownOpen)}
                // AJOUT: dark:hover:bg-gray-700
                className="flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg transition-colors hover:bg-yellow-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm md:text-base">
                  {getInitials(selectedChild.firstName, selectedChild.lastName)}
                </div>
                <div className="text-left hidden md:block">
                  {/* AJOUT: dark:text-white */}
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedChild.class?.name || 'Non assigné'}
                  </p>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform ${isChildDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isChildDropdownOpen && children.length > 0 && (
                // AJOUT: dark:bg-gray-800 dark:border-gray-700
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                  <p className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">Changer d'enfant</p>
                  <div className="p-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleSelectChild(child)}
                        // AJOUT: dark:hover:bg-gray-700
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-yellow-100 dark:hover:bg-gray-700 ${
                          selectedChild?.id === child.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(child.firstName, child.lastName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {child.class?.name || 'Non assigné'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Aucun enfant
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};