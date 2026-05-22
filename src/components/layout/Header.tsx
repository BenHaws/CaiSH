import React from 'react';
import { useIndustry } from '../../IndustryContext';
import { useNavigation } from '../../contexts/NavigationContext';

interface HeaderProps {
  activeTab: string;
  selectedEntityName: string;
  isProduction: boolean;
  setIsProduction: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, selectedEntityName, isProduction, setIsProduction }) => {
  const { activeVertical } = useIndustry();
  const { setActiveTab } = useNavigation();

  return (
    <header className="px-12 pt-10 pb-6 flex justify-between items-end border-b border-white/5 relative z-30">
      <div className="flex items-center gap-10">
         <div>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 block opacity-80">
              {selectedEntityName || 'Enterprise Workspace'}
            </span>
            <div className="flex items-center gap-6">
               <h1 className="text-4xl font-light tracking-tighter text-white capitalize">
                  {activeTab.replace('-', ' ')} <span className="font-semibold italic">{activeVertical || ''}</span>
               </h1>
            </div>
         </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab('admin')}
          className="hidden md:flex flex-col items-end px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          title="Open Admin Console"
        >
          <span className="text-[9px] uppercase tracking-[0.24em] text-slate-500 font-black">Industry Mode</span>
          <span className="text-xs font-bold text-orange-300">{activeVertical}</span>
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">Global Admin</p>
          <p className="text-xs text-slate-400">Identity Verified</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/30 flex items-center justify-center font-bold text-lg shadow-lg">
          GA
        </div>
      </div>
    </header>
  );
};
