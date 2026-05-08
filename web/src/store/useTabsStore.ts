import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TabItem {
  key: string;
  title: string;
  path: string;
  icon?: string;
  closable?: boolean;
  keepAlive?: boolean;
  affix?: boolean;
}

interface TabsState {
  tabs: TabItem[];
  activeKey: string;
  cachedKeys: string[];
  refreshKeys: Record<string, number>;
  ensureTab: (tab: TabItem) => void;
  addTab: (tab: TabItem) => void;
  removeTab: (key: string) => void;
  setActiveKey: (key: string) => void;
  refreshTab: (key: string) => void;
  closeCurrent: () => void;
  closeLeft: (key: string) => void;
  closeRight: (key: string) => void;
  closeOther: (key: string) => void;
  closeAll: () => void;
  resetToAffixTabs: () => void;
}

const DASHBOARD_TAB: TabItem = {
  key: "/dashboard",
  path: "/dashboard",
  title: "工作台",
  icon: "HomeOutlined",
  closable: false,
  keepAlive: true,
  affix: true,
};

const normalizeTab = (tab: TabItem): TabItem => ({
  ...tab,
  key: tab.path,
  path: tab.path,
  closable: tab.affix ? false : tab.closable !== false,
  keepAlive: tab.keepAlive !== false,
  affix: tab.affix === true,
});

const ensureDashboardTab = (tabs: TabItem[]) => {
  const normalizedTabs = tabs.map(normalizeTab);
  const dashboardIndex = normalizedTabs.findIndex(
    (tab) => tab.key === DASHBOARD_TAB.key,
  );

  if (dashboardIndex === -1) {
    return [DASHBOARD_TAB, ...normalizedTabs];
  }

  const dashboardTab = {
    ...normalizedTabs[dashboardIndex],
    ...DASHBOARD_TAB,
  };

  return [
    dashboardTab,
    ...normalizedTabs.filter((tab) => tab.key !== DASHBOARD_TAB.key),
  ];
};

const getCachedKeys = (tabs: TabItem[]) =>
  tabs.filter((tab) => tab.keepAlive !== false).map((tab) => tab.key);

const getSafeActiveKey = (tabs: TabItem[], activeKey?: string) => {
  if (activeKey && tabs.some((tab) => tab.key === activeKey)) {
    return activeKey;
  }

  return tabs[0]?.key ?? "";
};

const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [DASHBOARD_TAB],
      activeKey: DASHBOARD_TAB.key,
      cachedKeys: [DASHBOARD_TAB.key],
      refreshKeys: {},

      ensureTab: (tab) => {
        const normalizedTab = normalizeTab(tab);
        const { tabs } = get();
        const exists = tabs.find((item) => item.key === normalizedTab.key);

        if (exists) {
          const nextTabs = tabs.map((item) =>
            item.key === normalizedTab.key ? { ...item, ...normalizedTab } : item,
          );
          set({
            tabs: ensureDashboardTab(nextTabs),
            activeKey: normalizedTab.key,
            cachedKeys: getCachedKeys(ensureDashboardTab(nextTabs)),
          });
          return;
        }

        const nextTabs = ensureDashboardTab([...tabs, normalizedTab]);
        set({
          tabs: nextTabs,
          activeKey: normalizedTab.key,
          cachedKeys: getCachedKeys(nextTabs),
        });
      },

      addTab: (tab) => get().ensureTab(tab),

      removeTab: (key) => {
        const { tabs, activeKey, refreshKeys } = get();
        const index = tabs.findIndex((tab) => tab.key === key);
        if (index === -1) return;

        const currentTab = tabs[index];
        if (currentTab.closable === false || currentTab.affix) return;

        const nextTabs = ensureDashboardTab(tabs.filter((tab) => tab.key !== key));
        const nextRefreshKeys = { ...refreshKeys };
        delete nextRefreshKeys[key];

        let nextActiveKey = activeKey;
        if (activeKey === key) {
          const fallbackTab =
            nextTabs[Math.min(index, nextTabs.length - 1)] ??
            nextTabs[nextTabs.length - 1];
          nextActiveKey = fallbackTab?.key ?? DASHBOARD_TAB.key;
        }

        set({
          tabs: nextTabs,
          activeKey: getSafeActiveKey(nextTabs, nextActiveKey),
          cachedKeys: getCachedKeys(nextTabs),
          refreshKeys: nextRefreshKeys,
        });
      },

      setActiveKey: (key) => set({ activeKey: key }),

      refreshTab: (key) => {
        const { refreshKeys } = get();
        set({
          refreshKeys: {
            ...refreshKeys,
            [key]: (refreshKeys[key] ?? 0) + 1,
          },
        });
      },

      closeCurrent: () => {
        const { activeKey } = get();
        get().removeTab(activeKey);
      },

      closeLeft: (key) => {
        const { tabs, activeKey } = get();
        const index = tabs.findIndex((tab) => tab.key === key);
        if (index <= 0) return;

        const nextTabs = ensureDashboardTab(
          tabs.filter((tab, tabIndex) => tab.affix || tabIndex >= index),
        );
        const preferredActiveKey = nextTabs.some((tab) => tab.key === activeKey)
          ? activeKey
          : key;
        set({
          tabs: nextTabs,
          activeKey: getSafeActiveKey(nextTabs, preferredActiveKey),
          cachedKeys: getCachedKeys(nextTabs),
        });
      },

      closeRight: (key) => {
        const { tabs, activeKey } = get();
        const index = tabs.findIndex((tab) => tab.key === key);
        if (index === -1 || index === tabs.length - 1) return;

        const nextTabs = ensureDashboardTab(
          tabs.filter((tab, tabIndex) => tab.affix || tabIndex <= index),
        );
        const preferredActiveKey = nextTabs.some((tab) => tab.key === activeKey)
          ? activeKey
          : key;
        set({
          tabs: nextTabs,
          activeKey: getSafeActiveKey(nextTabs, preferredActiveKey),
          cachedKeys: getCachedKeys(nextTabs),
        });
      },

      closeOther: (key) => {
        const { tabs } = get();
        const nextTabs = ensureDashboardTab(
          tabs.filter((tab) => tab.affix || tab.key === key),
        );
        set({
          tabs: nextTabs,
          activeKey: getSafeActiveKey(nextTabs, key),
          cachedKeys: getCachedKeys(nextTabs),
        });
      },

      closeAll: () => {
        const nextTabs = ensureDashboardTab(
          get().tabs.filter((tab) => tab.affix || tab.closable === false),
        );
        set({
          tabs: nextTabs,
          activeKey: nextTabs[0]?.key ?? DASHBOARD_TAB.key,
          cachedKeys: getCachedKeys(nextTabs),
        });
      },

      resetToAffixTabs: () => {
        const nextTabs = ensureDashboardTab(
          get().tabs.filter((tab) => tab.affix || tab.closable === false),
        );
        set({
          tabs: nextTabs,
          activeKey: nextTabs[0]?.key ?? DASHBOARD_TAB.key,
          cachedKeys: getCachedKeys(nextTabs),
          refreshKeys: {},
        });
      },
    }),
    {
      name: "tabs-storage",
      partialize: (state) => ({
        tabs: state.tabs,
        activeKey: state.activeKey,
      }),
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<TabsState>;
        const tabs = ensureDashboardTab(typedState.tabs ?? currentState.tabs);
        const activeKey = getSafeActiveKey(tabs, typedState.activeKey);

        return {
          ...currentState,
          ...typedState,
          tabs,
          activeKey,
          cachedKeys: getCachedKeys(tabs),
          refreshKeys: {},
        };
      },
    },
  ),
);

export default useTabsStore;
