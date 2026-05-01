import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SimulationState {
  isActive: boolean;
  interestRateShock: number; // in bps, e.g. 200
  fxVolatility: number; // multiplier, e.g. 1.05 for +5%
  defaultRateShock: number; // multiplier
}

interface SimulationContextType {
  state: SimulationState;
  toggleActive: () => void;
  setRateShock: (val: number) => void;
  setFxVol: (val: number) => void;
  setDefaultShock: (val: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>({
    isActive: false,
    interestRateShock: 0,
    fxVolatility: 1,
    defaultRateShock: 1,
  });

  const toggleActive = () => setState(prev => ({ ...prev, isActive: !prev.isActive }));
  const setRateShock = (val: number) => setState(prev => ({ ...prev, interestRateShock: val }));
  const setFxVol = (val: number) => setState(prev => ({ ...prev, fxVolatility: val }));
  const setDefaultShock = (val: number) => setState(prev => ({ ...prev, defaultRateShock: val }));

  return (
    <SimulationContext.Provider value={{ state, toggleActive, setRateShock, setFxVol, setDefaultShock }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
