import { create } from 'zustand';
import { Person, Relationship } from '@/types/types';
import { fetchFamilyData } from '@/services/family/fetchFamily';
import { addFamilyMember, deleteFamilyMember } from '@/services/family/mutateFamily';

interface AppState {
  people: Person[];
  relationships: Relationship[];
  isLoading: boolean;
  error: string | null;
  selectedPersonId: string | null;
  meId: string | null;
  highlightedNodeIds: Set<string>;

  // Route State
  routeNodeIds: string[];
  isRouteMode: boolean;

  isBottomSheetOpen: boolean;
  isEditModeRequested: boolean;
  layoutDirection: 'TB' | 'LR';
  visibleGenerations: number;

  // Actions
  initialize: () => Promise<void>;
  selectPerson: (id: string | null, editMode?: boolean) => void;
  setMe: (id: string | null) => void;
  setHighlightedNodes: (ids: Set<string>) => void;
  setRouteNodes: (ids: string[]) => void;
  toggleRouteMode: (active: boolean) => void;
  clearRoute: () => void;
  showMoreGenerations: () => void;
  toggleLayout: () => void;

  // Sync Actions
  addPerson: (person: Person, sourceId?: string, targetId?: string, spouseId?: string) => Promise<void>;
  updatePerson: (id: string, data: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  getStats: () => { total: number; deceased: number; generations: number };

  // Mobile Interaction
  interactionNodeId: string | null;
  setInteractionNodeId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  people: [],
  relationships: [],
  isLoading: false,
  error: null,
  selectedPersonId: null,
  meId: localStorage.getItem('family_tree_me_id'),
  highlightedNodeIds: new Set(),
  interactionNodeId: null,

  routeNodeIds: [],
  isRouteMode: false,
  isBottomSheetOpen: false,
  isEditModeRequested: false,
  layoutDirection: 'TB',
  visibleGenerations: 5,

  initialize: async () => {
    // Chỉ hiện loading khi chưa có dữ liệu để tránh unmount component gây mất vị trí
    if (get().people.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const { people, relationships } = await fetchFamilyData();
      set({ people, relationships, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectPerson: (id, editMode = false) => set({
    selectedPersonId: id,
    isBottomSheetOpen: !!id,
    isEditModeRequested: editMode
  }),

  setMe: (id) => {
    if (id) localStorage.setItem('family_tree_me_id', id);
    else localStorage.removeItem('family_tree_me_id');
    set({ meId: id });
  },

  setInteractionNodeId: (id) => set({ interactionNodeId: id }),
  setRouteNodes: (ids) => set({ routeNodeIds: ids }),
  toggleRouteMode: (active) => set({ isRouteMode: active, highlightedNodeIds: new Set() }),
  clearRoute: () => set({ routeNodeIds: [], highlightedNodeIds: new Set() }),
  setHighlightedNodes: (ids) => set({ highlightedNodeIds: ids }),
  showMoreGenerations: () => set((state) => ({ visibleGenerations: state.visibleGenerations + 1 })),
  toggleLayout: () => set((state) => ({ layoutDirection: state.layoutDirection === 'TB' ? 'LR' : 'TB' })),

  getStats: () => {
    const { people } = get();
    return {
      total: people.length,
      deceased: people.filter(p => !p.isAlive).length,
      generations: Math.max(...people.map(p => p.order || 1), 1)
    };
  },

  addPerson: async (person, sourceId, targetId, spouseId) => {
    try {
      await addFamilyMember(person, sourceId, targetId, spouseId);
      await get().initialize(); // Refresh
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deletePerson: async (id) => {
    try {
      await deleteFamilyMember(id);
      await get().initialize(); // Refresh
      if (get().selectedPersonId === id) set({ selectedPersonId: null, isBottomSheetOpen: false });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updatePerson: async (id, data) => {
    try {
      // Optimistic update (optional but good for UX, though here we just await)
      // For now, let's just wait for server confirmation to avoid complexity

      // Filter out undefined values to avoid sending empty updates if not needed, 
      // but the service handles it.
      await import('@/services/family/mutateFamily').then(m => m.updateFamilyMember(id, data));

      await get().initialize();
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
