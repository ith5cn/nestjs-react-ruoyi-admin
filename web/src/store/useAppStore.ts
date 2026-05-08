import { getConfigInfoApi } from '@/api/system/config';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type LayoutMode = 'basic' | 'mixed';

interface AppState {
  siderCollapsed: boolean;
  layoutMode: LayoutMode;
  setSiderCollapsed: (collapsed: boolean) => void;
  toggleSider: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  siteConfig: any;
  setSiteConfig: (config: any) => void;
  initSiteConfig: () => Promise<void>;
}

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        siderCollapsed: false,
        layoutMode: 'mixed',
        siteConfig: null,

        setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),

        toggleSider: () => set((state) => ({ siderCollapsed: !state.siderCollapsed })),

        setLayoutMode: (mode) => set({ layoutMode: mode }),

        setSiteConfig: (config) => set({ siteConfig: config }),

        initSiteConfig: async () => {
          const res = await getConfigInfoApi('site_setting');
          console.log("site_setting", res);
          set({ siteConfig: res.data });
        }
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ siderCollapsed: state.siderCollapsed, layoutMode: state.layoutMode, siteConfig: state.siteConfig }),
      }
    )
  )
);

export default useAppStore;
