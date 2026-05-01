import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Globe, 
  GripVertical, 
  ChevronRight, 
  Layers, 
  Trash2, 
  Plus,
  Network
} from 'lucide-react';
import { CorporateEntity } from '../../types';

interface NexusRelay {
  id: string;
  name: string;
  parentId: string | null;
  baseCurrency: string;
}

interface SortableRelayProps {
  relay: NexusRelay;
  depth: number;
  isDragOverlay?: boolean;
  key?: string | number;
}

const SortableRelay = ({ relay, depth, isDragOverlay }: SortableRelayProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: relay.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: `${depth * 40}px`,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative mb-4 group ${isDragging ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className={`liquid-glass p-6 flex items-center justify-between border-white/5 hover:border-blue-500/30 transition-all ${isDragOverlay ? 'border-blue-500 bg-blue-500/10' : ''}`}>
        <div className="flex items-center gap-6">
          <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-colors">
            <GripVertical className="w-5 h-5 text-slate-600" />
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${relay.parentId === null ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10'}`}>
            {relay.parentId === null ? <Globe className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-slate-400" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">{relay.name}</h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1.5 opacity-60">
              Relay ID: {relay.id.substring(0, 8)} • {relay.baseCurrency}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Boundary</span>
              <p className="text-[10px] font-mono text-emerald-400 mt-1">RLS SECURED</p>
           </div>
           <button className="p-2 hover:bg-white/10 rounded-lg text-slate-600 hover:text-white transition-all">
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}

export default function NexusRelayEditor({ entities: initialEntities }: { entities: CorporateEntity[] }) {
  const [relays, setRelays] = useState<NexusRelay[]>(initialEntities.map(e => ({ id: e.id, name: e.name, parentId: e.parentId, baseCurrency: e.baseCurrency })));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Helper to build a flat list that preserves a pseudo-hierarchical order for the vertical sortable
  const orderedRelays = useMemo(() => {
    const build = (parentId: string | null, depth: number): { relay: NexusRelay; depth: number }[] => {
      return relays
        .filter(n => n.parentId === parentId)
        .flatMap(n => [{ relay: n, depth }, ...build(n.id, depth + 1)]);
    };
    return build(null, 0);
  }, [relays]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Reparenting logic: If dragging over another node, we could potentially reparent.
    // For a "Slick" demo, we'll assume a vertical sort that updates parentId if dragged slightly offset.
    // However, dnd-kit-sortable is purely for order.
    // We'll implement a simpler: drag and drop on another node to make it a child.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Find the index in our current flat relays array
      const oldIndex = relays.findIndex(n => n.id === active.id);
      const newIndex = relays.findIndex(n => n.id === over.id);

      // Check for circular inheritance
      const isDescendant = (parentId: string, targetId: string): boolean => {
        const children = relays.filter(n => n.parentId === parentId);
        if (children.some(c => c.id === targetId)) return true;
        return children.some(c => isDescendant(c.id, targetId));
      };

      if (isDescendant(active.id as string, over.id as string)) {
        console.warn("Circular inheritance prevented.");
        return;
      }

      // Reparent: active relay becomes child of over relay
      const newRelays = [...relays];
      newRelays[oldIndex].parentId = over.id as string;
      setRelays(newRelays);
    }
  };

  const activeRelay = activeId ? relays.find(n => n.id === activeId) : null;
  const activeDepth = activeId ? orderedRelays.find(o => o.relay.id === activeId)?.depth || 0 : 0;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500">Relay Orchestrator</span>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Nexus <span className="font-semibold">Topology Editor</span></h2>
          <p className="text-slate-400">Re-parent subsidiaries and accounts with real-time RLS permission recalculation.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 glass-card hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
             <Plus className="w-4 h-4" />
             Add Subsidiary
           </button>
           <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all">
             Commit Nexus Changes
           </button>
        </div>
      </div>

      <div className="relative liquid-glass p-10 bg-white/[0.01]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={relays.map(n => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {orderedRelays.map(({ relay, depth }) => (
                <SortableRelay key={relay.id} relay={relay} depth={depth} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeRelay ? (
              <SortableRelay relay={activeRelay} depth={activeDepth} isDragOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-12 p-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-6">
           <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Network className="w-6 h-6 text-blue-400" />
           </div>
           <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Cerebro Boundary Enforcement</p>
              <p className="text-[10px] text-slate-400 italic">
                "Reparenting triggers immediate recalibration of RLS policies for 1,420 identity relays. Isolation confirmed."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
