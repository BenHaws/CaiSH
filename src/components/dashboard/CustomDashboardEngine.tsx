import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Plus, Save, RotateCcw, Monitor, Trash2, ChevronLeft } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { DashboardLayout, WidgetConfig } from '../../types';
import DashboardWidget from './DashboardWidget';
import { AvailableWidgets } from './WidgetRegistry';
import GlobalPulseMap from './GlobalPulseMap';
import { useIndustry } from '../../IndustryContext';

const oilGasDashboardCards: WidgetConfig[] = [
  {
    id: 'oil-gas-hedge-effectiveness',
    componentKey: 'OIL_GAS_HEDGE_EFFECTIVENESS',
    w: 6,
    title: 'Hedge Effectiveness'
  },
  {
    id: 'oil-gas-basis-risk',
    componentKey: 'OIL_GAS_BASIS_RISK',
    w: 6,
    title: 'Basis Risk Curve'
  }
];

const withOilGasCards = (layout: DashboardLayout): DashboardLayout => {
  const existingKeys = new Set(layout.config.map(widget => widget.componentKey));
  const missingCards = oilGasDashboardCards.filter(card => !existingKeys.has(card.componentKey));

  if (missingCards.length === 0) return layout;

  return {
    ...layout,
    config: [...layout.config, ...missingCards]
  };
};

export default function CustomDashboardEngine() {
  const { activeVertical } = useIndustry();
  const [layout, setLayout] = useState<DashboardLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    treasuryService.getDashboard().then((savedLayout) => {
      if (activeVertical !== 'Oil & Gas') {
        setLayout(savedLayout);
        return;
      }

      const enrichedLayout = withOilGasCards(savedLayout);
      setLayout(enrichedLayout);

      if (enrichedLayout !== savedLayout) {
        treasuryService.updateDashboard(enrichedLayout).catch(error => {
          console.error('Oil & Gas dashboard card persistence failed:', error);
        });
      }
    });
  }, [activeVertical]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (layout && over && active.id !== over.id) {
      const oldIndex = layout.config.findIndex(w => w.id === active.id);
      const newIndex = layout.config.findIndex(w => w.id === over.id);
      const newConfig = arrayMove(layout.config, oldIndex, newIndex);
      setLayout({ ...layout, config: newConfig });
    }
  };

  const addWidget = (widgetMetadata: typeof AvailableWidgets[0]) => {
    if (!layout) return;
    const newWidget: WidgetConfig = {
      id: `w-${Date.now()}`,
      componentKey: widgetMetadata.key,
      w: 6, // Default to half width
      title: widgetMetadata.title
    };
    setLayout({ ...layout, config: [...layout.config, newWidget] });
  };

  const removeWidget = (id: string) => {
    if (!layout) return;
    setLayout({ ...layout, config: layout.config.filter(w => w.id !== id) });
  };

  const saveLayout = async () => {
    if (!layout) return;
    setIsSaving(true);
    try {
      await treasuryService.updateDashboard(layout);
      setIsEditing(false);
      setIsSidebarOpen(false);
      // Simulating the "Vibe" success toast
      console.log("Dashboard vibe synchronized.");
    } catch (error) {
      console.error("SYNC_ERROR:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!layout) return <div className="text-white p-20 text-center animate-pulse tracking-widest uppercase text-xs font-bold">Synchronizing Vibe State...</div>;

  return (
    <div className="relative min-h-[calc(100vh-160px)]">
      {/* Dashboard Header/Controls */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Layout className="w-5 h-5 text-blue-400" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">Nexus Viewport</span>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white">{layout.name}</h2>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (layout) {
                // Toggle between current layout and a temporary layout containing all widgets
                const allWidgetsInLayout = layout.config.length === AvailableWidgets.length;
                if (allWidgetsInLayout) {
                   // Refresh from storage to get original layout
                   treasuryService.getDashboard().then(setLayout);
                } else {
                  const allConfig: WidgetConfig[] = AvailableWidgets.map((m, i) => ({
                    id: `temp-${m.key}-${i}`,
                    componentKey: m.key,
                    w: 6,
                    title: m.title
                  }));
                  setLayout({ ...layout, config: allConfig });
                }
              }
            }}
            className={`flex items-center justify-center p-3 glass-card rounded-2xl transition-all ${layout?.config.length === AvailableWidgets.length ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-slate-400 hover:text-white'}`}
            title="Toggle All Widgets"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 glass-card hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Customize View
            </button>
          ) : (
            <div className="flex gap-3">
               <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSidebarOpen ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </button>
              <button 
                onClick={saveLayout}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Synchronizing...' : 'Deploy Vibe'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Global Pulse Hero */}
      <div className="mb-12">
        <GlobalPulseMap />
      </div>

      {/* Main Dashboard Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-12 gap-8">
          <SortableContext items={layout.config.map(w => w.id)} strategy={rectSortingStrategy}>
            {layout.config.map((widget) => (
              <div 
                key={widget.id} 
                className={`col-span-12 ${widget.w === 6 ? 'md:col-span-6 xl:col-span-4' : widget.w === 4 ? 'md:col-span-4' : 'md:col-span-12'}`}
              >
                <DashboardWidget 
                  widget={widget} 
                  isEditing={isEditing} 
                  onRemove={removeWidget}
                />
              </div>
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Side Selection Panel */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-96 bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 z-[70] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-semibold text-white tracking-tight">Widget Library</h3>
                 <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500 rotate-180" />
                 </button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {AvailableWidgets.map((w) => (
                  <button 
                    key={w.key}
                    onClick={() => addWidget(w)}
                    className="w-full text-left glass-card p-6 border-white/5 hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 transition-colors">
                          <w.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                       </div>
                       <h5 className="font-bold text-sm text-white tracking-wide uppercase">{w.title}</h5>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">{w.description}</p>
                    <div className="mt-4 flex justify-end">
                       <Plus className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-10 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                 <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mb-2 text-center">Identity Relay Ben@cwgs.wtf</p>
                 <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
                   Custom layouts are encrypted and persisted to your corporate entity context.
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Editing Overlay Indicator */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-6 px-8 py-4 bg-blue-600 rounded-full shadow-2xl shadow-blue-900/40 border border-blue-400/30"
        >
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
             <span className="text-xs font-bold text-white uppercase tracking-widest">Layout Editor Active</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <button 
            onClick={() => { setIsEditing(false); setIsSidebarOpen(false); }}
            className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-widest"
          >
            Cancel Changes
          </button>
        </motion.div>
      )}
    </div>
  );
}
