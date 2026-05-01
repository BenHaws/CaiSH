import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Banknote, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  LucideIcon,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { useIndustry } from '../../IndustryContext';
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
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  menuItems: MenuItem[];
  onSearchToggle?: () => void;
}

interface SortableMenuItemProps {
  item: MenuItem;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isEditMode: boolean;
  isSidebarCollapsed: boolean;
  hiddenItems: string[];
  toggleVisibility: (id: string, e: React.MouseEvent) => void;
}

const SortableMenuItem: React.FC<SortableMenuItemProps> = ({ 
  item, 
  activeTab, 
  setActiveTab, 
  isEditMode, 
  isSidebarCollapsed, 
  hiddenItems, 
  toggleVisibility 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        role="button"
        tabIndex={isEditMode ? -1 : 0}
        onKeyDown={(e) => {
          if (!isEditMode && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setActiveTab(item.id as any);
          }
        }}
        onClick={() => !isEditMode && setActiveTab(item.id as any)}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-500 relative group cursor-pointer ${
          activeTab === item.id 
            ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/20' 
            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
        } ${isSidebarCollapsed ? 'justify-center' : ''} ${isEditMode && hiddenItems.includes(item.id) ? 'opacity-40 grayscale' : ''} ${isEditMode ? 'cursor-default transition-none' : ''}`}
        title={isSidebarCollapsed && !isEditMode ? item.label : ''}
      >
        {isEditMode && !isSidebarCollapsed && (
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
        {!isSidebarCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
          >
            {item.label}
          </motion.span>
        )}

        {isEditMode && !isSidebarCollapsed && (
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => toggleVisibility(item.id, e)}
              className={`p-1 hover:bg-white/10 rounded transition-colors ${hiddenItems.includes(item.id) ? 'text-rose-500' : 'text-emerald-500'}`}
            >
              {hiddenItems.includes(item.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        )}

        {activeTab === item.id && !isSidebarCollapsed && !isEditMode && (
          <motion.div layoutId="active-pill" className="ml-auto">
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </motion.div>
        )}
        {isSidebarCollapsed && activeTab === item.id && (
          <motion.div 
            layoutId="active-pill-collapsed"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-l-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
          />
        )}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, menuItems, onSearchToggle }) => {
  const { activeVertical, isSidebarCollapsed, setSidebarCollapsed } = useIndustry();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [hiddenItems, setHiddenItems] = React.useState<string[]>([]);
  const [itemOrder, setItemOrder] = React.useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load persistence
  React.useEffect(() => {
    const savedHidden = localStorage.getItem('kyraibos-nav-hidden');
    if (savedHidden) setHiddenItems(JSON.parse(savedHidden));
    
    const savedOrder = localStorage.getItem('kyraibos-nav-order');
    if (savedOrder) setItemOrder(JSON.parse(savedOrder));
  }, []);

  // Sync persistence
  React.useEffect(() => {
    localStorage.setItem('kyraibos-nav-hidden', JSON.stringify(hiddenItems));
  }, [hiddenItems]);

  React.useEffect(() => {
    localStorage.setItem('kyraibos-nav-order', JSON.stringify(itemOrder));
  }, [itemOrder]);

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItemOrder((items) => {
        const currentList = items.length > 0 ? [...items] : menuItems.map(m => m.id);
        
        // Ensure all current menu items are in the list
        menuItems.forEach(m => {
          if (!currentList.includes(m.id)) currentList.push(m.id);
        });

        const oldIndex = currentList.indexOf(active.id as string);
        const newIndex = currentList.indexOf(over.id as string);
        
        return arrayMove(currentList, oldIndex, newIndex);
      });
    }
  };

  // Sort and filter menu items based on local state
  const displayItems = [...menuItems].sort((a, b) => {
    const orderA = itemOrder.indexOf(a.id);
    const orderB = itemOrder.indexOf(b.id);
    if (orderA === -1 && orderB === -1) return 0;
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;
    return orderA - orderB;
  }).filter(item => isEditMode || !hiddenItems.includes(item.id));

  const handleItemClick = (id: string) => {
    if (id === 'search') {
      onSearchToggle?.();
      return;
    }
    setActiveTab(id as any);
  };

  return (
    <motion.aside 
      animate={{ width: isSidebarCollapsed ? 88 : 284 }}
      className="bg-slate-950/35 backdrop-blur-2xl border-r border-white/10 flex flex-col shrink-0 overflow-hidden relative m-3 mr-0 rounded-2xl"
    >
      {/* Fixed Header */}
      <div className="px-6 py-7 border-b border-white/5 flex items-center justify-between shrink-0 h-24">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed ? (
            <motion.div 
              key="logo-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight text-white whitespace-nowrap">CaiSH</h1>
            </motion.div>
          ) : (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto group hover:scale-110 transition-transform"
            >
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Banknote className="w-6 h-6 text-white" />
              </motion.div>
            </button>
          )}
        </AnimatePresence>

        {!isSidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(true)}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-7 space-y-2 overflow-y-auto scrollbar-hide custom-scrollbar pb-20">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {displayItems.map((item) => (
              <SortableMenuItem 
                key={item.id}
                item={item}
                activeTab={activeTab}
                setActiveTab={handleItemClick}
                isEditMode={isEditMode}
                isSidebarCollapsed={isSidebarCollapsed}
                hiddenItems={hiddenItems}
                toggleVisibility={toggleVisibility}
              />
            ))}
          </SortableContext>
        </DndContext>
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 bg-black/10 flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-4 text-slate-300 hover:text-white transition-colors flex-1 group ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all shrink-0">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-sm font-black uppercase tracking-[0.2em] text-[9px] whitespace-nowrap opacity-60 group-hover:opacity-100 italic transition-opacity">Admin Console</span>
          )}
        </button>

        {!isSidebarCollapsed && (
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 group ${isEditMode ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'text-slate-400 font-black uppercase tracking-widest text-[10px]'}`}
            title={isEditMode ? "Lock Navigation" : "Unlock Navigation"}
          >
            {isEditMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        )}
      </div>
    </motion.aside>
  );
};
