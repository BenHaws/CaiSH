import React, { createContext, useContext, useState } from 'react';

type TabType = 'dashboard' | 'nexus' | 'scenario' | 'security' | 'fx' | 'payments' | 'ledger' | 'cerebro' | 'capital' | 'debt' | 'energy' | 'tech' | 'manufacturing' | 'real-estate' | 'insurance' | 'dev' | 'admin' | 'ingestion';

interface NavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode, initialTab?: TabType }> = ({ children, initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
