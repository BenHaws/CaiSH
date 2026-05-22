import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Settings, 
  Banknote,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  AlertCircle,
  BookOpen,
  BrainCircuit,
  Vault,
  Briefcase,
  Flame,
  Cpu,
  Factory,
  Menu,
  Terminal,
  Building,
  Stethoscope,
  ShoppingCart,
  Anchor,
  Search
} from 'lucide-react';
import { treasuryService } from './services/treasuryService';
import { CorporateEntity, BankAccount } from './types';

// Components
import CustomDashboardEngine from './components/dashboard/CustomDashboardEngine';
import NexusView from './components/dashboard/NexusView';
import ScenarioEngine from './components/dashboard/ScenarioEngine';
import FXRisk from './components/dashboard/FXRisk';
import PaymentQueue from './components/dashboard/PaymentQueue';
import VirtualLedger from './components/dashboard/VirtualLedger';
import SecurityCenter from './components/dashboard/SecurityCenter';
import ConnectivityWizard from './components/dashboard/ConnectivityWizard';

import { IndustryConfig, IndustryVertical } from './types';
import { IndustryProvider, useIndustry } from './IndustryContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import NeuralSearch, { NeuralSearchHandle } from './components/layout/NeuralSearch';
import React, { useRef } from 'react';

import { SimulationProvider, useSimulation } from './contexts/SimulationContext';
import IngestionPage from './pages/IngestionPage';

import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

const Cerebro = lazy(() => import('./components/dashboard/Cerebro'));
const WorkingCapitalHub = lazy(() => import('./components/dashboard/working-capital/WorkingCapitalHub'));
const DebtInvestmentsModule = lazy(() => import('./components/dashboard/DebtInvestmentsModule'));
const EnergyHedgingCockpit = lazy(() => import('./components/dashboard/EnergyHedgingCockpit'));
const TechValuationCockpit = lazy(() => import('./components/dashboard/TechValuationCockpit'));
const ManufacturingCockpit = lazy(() => import('./components/dashboard/ManufacturingCockpit'));
const RealEstateTrustMonitor = lazy(() => import('./components/dashboard/RealEstateTrustMonitor'));
const DevGlobalAggregator = lazy(() => import('./components/dashboard/DevGlobalAggregator'));
const AdminConsole = lazy(() => import('./components/dashboard/AdminConsole'));
const InsuranceSolvencyCockpit = lazy(() =>
  import('./components/dashboard/InsuranceSolvencyCockpit').then(module => ({ default: module.InsuranceSolvencyCockpit }))
);
const RetailNettingHub = lazy(() =>
  import('./components/dashboard/RetailNettingHub').then(module => ({ default: module.RetailNettingHub }))
);

function ModuleFallback() {
  return (
    <div className="p-12 glass-card text-center text-xs font-black uppercase tracking-[0.25em] text-slate-500 animate-pulse">
      Hydrating module...
    </div>
  );
}

function AppContent() {
  const { activeVertical, config } = useIndustry();
  const { state: simState, toggleActive: toggleSim } = useSimulation();
  const { activeTab, setActiveTab } = useNavigation();
  const searchRef = useRef<NeuralSearchHandle>(null);
  const hasHydratedVerticalRef = useRef(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [entities, setEntities] = useState<CorporateEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<CorporateEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync isProduction with SimulationContext.isActive
  const isProduction = !simState.isActive;
  const setIsProduction = (val: boolean) => {
    if (val !== isProduction) toggleSim();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const entData = await treasuryService.getEntities();
        setEntities(entData);
        if (entData.length > 0) setSelectedEntity(entData[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const menuItems = [
    { id: 'search', label: 'Search Nexus', icon: Search },
    { id: 'dashboard', label: 'Liquidity Dashboard', icon: LayoutDashboard },
    { id: 'cerebro', label: 'Cerebro AI', icon: BrainCircuit },
    { id: 'nexus', label: 'Nexus Topology', icon: Layers },
    { id: 'capital', label: 'Working Capital', icon: Briefcase },
    { id: 'energy', label: 'Energy Hedging', icon: Flame, condition: activeVertical === 'Oil & Gas' },
    { id: 'tech', label: 'Tech Valuation', icon: Cpu, condition: activeVertical === 'Technology' },
    { id: 'manufacturing', label: 'Inventory Hub', icon: Factory, condition: activeVertical === 'Manufacturing' },
    { id: 'real-estate', label: 'Real Estate Hub', icon: Building, condition: activeVertical === 'Real Estate' },
    { id: 'healthcare', label: 'Claims Engine', icon: Stethoscope, condition: activeVertical === 'Healthcare' },
    { id: 'insurance', label: 'Solvency Cockpit', icon: Anchor, condition: activeVertical === 'Insurance' },
    { id: 'retail', label: 'Retail Payables', icon: ShoppingCart, condition: activeVertical === 'Retail' },
    { id: 'dev', label: 'DEV CONTROL', icon: Terminal, condition: activeVertical === 'DEV' },
    { id: 'debt', label: 'Debt & Investments', icon: TrendingUp },
    { id: 'scenario', label: 'Scenario Engine', icon: Activity },
    { id: 'fx', label: 'FX Risk Exposure', icon: Banknote },
    { id: 'payments', label: 'Payment Integrity', icon: ShieldCheck },
    { id: 'ledger', label: 'Virtual Ledger', icon: BookOpen },
    { id: 'ingestion', label: 'ISO Ingestion', icon: Terminal },
    { id: 'security', label: 'Vault & Security', icon: Vault },
  ].filter(item => item.condition !== false);

  // Auto-Pivot: When industry shifts, redirect to the relevant hub if it's not the current tab
  // We only pivot if we are not currently in a system-level tool (Admin/Dev/Cerebro)
  useEffect(() => {
    const hubMap: Record<string, typeof activeTab> = {
      'Oil & Gas': 'energy',
      'Technology': 'tech',
      'Manufacturing': 'manufacturing',
      'Real Estate': 'real-estate',
      'Healthcare': 'healthcare',
      'Insurance': 'insurance',
      'Retail': 'retail',
      'DEV': 'dev'
    };
    
    const systemTabs = ['admin', 'dev', 'cerebro', 'security'];

    if (!config) {
      if (activeTab !== 'dashboard') setActiveTab('dashboard');
      return;
    }

    if (!hasHydratedVerticalRef.current) {
      hasHydratedVerticalRef.current = true;
      if (activeTab !== 'dashboard') setActiveTab('dashboard');
      return;
    }

    if (activeVertical && hubMap[activeVertical] && !systemTabs.includes(activeTab)) {
      setActiveTab(hubMap[activeVertical]);
    }
  }, [activeVertical]);

  // Vibe Sector Background Mapping
  useEffect(() => {
    // Background style management logic (already present via classes below)
  }, [activeVertical]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-base">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen h-full flex items-center justify-center p-5 bg-transparent transition-all duration-1000 ${isProduction ? 'ring-1 ring-emerald-500/30' : ''}`}>
      <div className={`relative liquid-glass-high w-full h-full flex flex-col md:flex-row shadow-2xl transition-all duration-1000 ${isProduction ? 'shadow-emerald-900/10' : 'shadow-blue-900/10'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          menuItems={menuItems} 
          onSearchToggle={() => searchRef.current?.open()}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header 
            activeTab={activeTab} 
            selectedEntityName={selectedEntity?.name || ''} 
            isProduction={isProduction} 
            setIsProduction={setIsProduction} 
          />

          {/* Viewport content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-black/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (selectedEntity?.id || '')}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<ModuleFallback />}>
                  {activeTab === 'dashboard' && (
                    <CustomDashboardEngine />
                  )}
                  {activeTab === 'cerebro' && (
                    <Cerebro />
                  )}
                  {activeTab === 'nexus' && (
                    <NexusView entities={entities} />
                  )}
                  {activeTab === 'capital' && (
                    <WorkingCapitalHub />
                  )}
                  {activeTab === 'debt' && (
                    <DebtInvestmentsModule />
                  )}
                  {activeTab === 'energy' && (
                    <EnergyHedgingCockpit />
                  )}
                  {activeTab === 'tech' && (
                    <TechValuationCockpit />
                  )}
                  {activeTab === 'manufacturing' && (
                    <ManufacturingCockpit />
                  )}
                  {activeTab === 'real-estate' && (
                    <RealEstateTrustMonitor />
                  )}
                  {activeTab === 'dev' && (
                    <DevGlobalAggregator />
                  )}
                  {activeTab === 'admin' && (
                    <AdminConsole />
                  )}
                  {activeTab === 'healthcare' && (
                    <div className="p-20 text-center glass-card border-sky-500/30 bg-sky-500/5">
                      <Stethoscope className="w-16 h-16 text-sky-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Claims Reconciliation Engine</h3>
                      <p className="text-sky-400 font-mono text-xs uppercase italic">Module Initializing: Waiting for Payor Webhook Feed...</p>
                    </div>
                  )}
                  {activeTab === 'insurance' && selectedEntity && (
                     <InsuranceSolvencyCockpit entity={selectedEntity} />
                  )}
                  {activeTab === 'retail' && (
                    <RetailNettingHub />
                  )}
                  {activeTab === 'scenario' && selectedEntity && (
                    <ScenarioEngine entity={selectedEntity} />
                  )}
                  {activeTab === 'fx' && (
                    <FXRisk />
                  )}
                  {activeTab === 'payments' && (
                    <PaymentQueue />
                  )}
                  {activeTab === 'ledger' && (
                    <VirtualLedger />
                  )}
                  {activeTab === 'ingestion' && (
                    <IngestionPage />
                  )}
                  {activeTab === 'security' && (
                    <SecurityCenter triggerWizard={() => setIsOnboarding(true)} />
                  )}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Branding */}
          <footer className="bg-white/[0.03] border-t border-white/10 px-10 py-4 flex justify-between items-center text-slate-400 text-xs font-medium">
             <p>Institutional Liquidity Architecture</p>
             <div className="flex items-center gap-3">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
               <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">CaiSH v4.3.0 Industry-Hardened</span>
             </div>
          </footer>
        </div>
      </div>

      {/* Connectivity Wizard (Onboarding) */}
      <AnimatePresence>
        {isOnboarding && (
          <ConnectivityWizard onComplete={() => setIsOnboarding(false)} />
        )}
      </AnimatePresence>

      <NeuralSearch ref={searchRef} />
    </div>
  );
}

export default function App() {
  return (
    <IndustryProvider>
      <SimulationProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </SimulationProvider>
    </IndustryProvider>
  );
}
