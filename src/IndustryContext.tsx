import React, { createContext, useContext, useState, useEffect } from 'react';
import { IndustryVertical, IndustryConfig } from './types';
import { treasuryService } from './services/treasuryService';

interface ThemeConfig {
  color: string;
  meshBg: string;
}

interface IndustryContextType {
  activeVertical: IndustryVertical;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  updateVertical: (v: IndustryVertical) => Promise<void>;
  config: IndustryConfig | null;
  theme: ThemeConfig;
}

const themeConfigs: Record<IndustryVertical, ThemeConfig> = {
  'Manufacturing': { color: 'amber-600', meshBg: 'bg-mesh-industrial' },
  'Healthcare': { color: 'blue-600', meshBg: 'bg-mesh-default' },
  'Real Estate': { color: 'emerald-600', meshBg: 'bg-mesh-property' },
  'Retail': { color: 'pink-600', meshBg: 'bg-mesh-default' },
  'Technology': { color: 'cyan-600', meshBg: 'bg-mesh-default' },
   'Oil & Gas': { color: 'orange-600', meshBg: 'bg-mesh-default' },
   'Insurance': { color: 'sky-600', meshBg: 'bg-mesh-default' }, // Vibe: Solvency Sky
   'DEV': { color: 'red-600', meshBg: 'bg-mesh-debug' },
};

const IndustryContext = createContext<IndustryContextType | undefined>(undefined);

export const IndustryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVertical, setActiveVertical] = useState<IndustryVertical>('Oil & Gas');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<IndustryConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const c = await treasuryService.getIndustryConfig();
        setConfig(c);
        setActiveVertical(c.activeVertical);
      } catch (error) {
        console.error('Failed to fetch industry config', error);
      }
    };
    fetchConfig();
  }, []);

  const updateVertical = async (v: IndustryVertical) => {
    try {
      await treasuryService.updateIndustryVertical(v);
      setActiveVertical(v);
      // Logic: Injects industry-specific PBCs into the active dashboard config
      console.log(`VERTICAL_SHIFT_SUCCESS: Priority set to ${v}`);
    } catch (error) {
      console.error('Failed to update vertical', error);
    }
  };

  const theme = themeConfigs[activeVertical] || themeConfigs['Oil & Gas'];

  return (
    <IndustryContext.Provider value={{ activeVertical, isSidebarCollapsed, setSidebarCollapsed, updateVertical, config, theme }}>
      <div className={`transition-all duration-1000 min-h-screen ${theme.meshBg}`}>
        {children}
      </div>
    </IndustryContext.Provider>
  );
};

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (!context) throw new Error('useIndustry must be used within IndustryProvider');
  return context;
};
