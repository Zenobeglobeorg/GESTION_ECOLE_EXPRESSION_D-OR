import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as studentService from '../services/studentService';

interface SelectedChildContextType {
  selectedChild: studentService.Student | null;
  setSelectedChild: (child: studentService.Student | null) => void;
  children: studentService.Student[];
  setChildren: (children: studentService.Student[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SelectedChildContext = createContext<SelectedChildContextType | undefined>(undefined);

export const useSelectedChild = () => {
  const context = useContext(SelectedChildContext);
  if (!context) {
    throw new Error('useSelectedChild must be used within a SelectedChildProvider');
  }
  return context;
};

interface SelectedChildProviderProps {
  children: ReactNode;
}

export const SelectedChildProvider: React.FC<SelectedChildProviderProps> = ({ children }) => {
  const [selectedChild, setSelectedChild] = useState<studentService.Student | null>(null);
  const [childrenList, setChildrenList] = useState<studentService.Student[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <SelectedChildContext.Provider
      value={{
        selectedChild,
        setSelectedChild,
        children: childrenList,
        setChildren: setChildrenList,
        loading,
        setLoading,
      }}
    >
      {children}
    </SelectedChildContext.Provider>
  );
};


