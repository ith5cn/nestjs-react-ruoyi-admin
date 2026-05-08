import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import {
  CloseOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import usePermissionStore from "@/store/usePermissionStore";
import useTabsStore, { type TabItem } from "@/store/useTabsStore";
import { staticRoutes } from "@/routers/staticRoutes";
import { renderIcon, type AppRouteRecord } from "@/utils/routeUtils";

interface CachedView {
  key: string;
  element: React.ReactNode;
  version: number;
}

const NestTags: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { dynamicRoutes } = usePermissionStore();
  const {
    tabs,
    activeKey,
    cachedKeys,
    refreshKeys,
    ensureTab,
    setActiveKey,
    removeTab,
    refreshTab,
    closeLeft,
    closeRight,
    closeOther,
    closeAll,
  } = useTabsStore();

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    key: string;
  } | null>(null);
  const [cachedViews, setCachedViews] = useState<CachedView[]>([]);
  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const pathname = location.pathname;
  const currentRefreshVersion = refreshKeys[pathname] ?? 0;

  const routeMetaMap = useMemo(() => {
    const routeMap = new Map<string, AppRouteRecord["meta"]>();
    [...staticRoutes, ...(dynamicRoutes as AppRouteRecord[])].forEach((route) => {
      if (route.isLayout !== 1 || route.isLink) return;
      routeMap.set(route.path, route.meta);
    });
    return routeMap;
  }, [dynamicRoutes]);

  const currentRouteMeta = routeMetaMap.get(pathname);

  useEffect(() => {
    const currentTab: TabItem = {
      key: pathname,
      path: pathname,
      title: currentRouteMeta?.title ?? pathname,
      icon: currentRouteMeta?.icon,
      affix: currentRouteMeta?.affix,
      closable: currentRouteMeta?.affix ? false : true,
      keepAlive: currentRouteMeta?.keepAlive ?? true,
    };

    ensureTab(currentTab);
  }, [ensureTab, currentRouteMeta, pathname]);

  useEffect(() => {
    if (!outlet) return;

    setCachedViews((previous) => {
      const nextViews = previous.filter(
        (view) => cachedKeys.includes(view.key) || view.key === pathname,
      );
      const currentIndex = nextViews.findIndex((view) => view.key === pathname);

      if (currentIndex === -1) {
        return [
          ...nextViews,
          {
            key: pathname,
            element: outlet,
            version: currentRefreshVersion,
          },
        ];
      }

      const currentView = nextViews[currentIndex];
      if (currentView.version !== currentRefreshVersion) {
        const updatedViews = [...nextViews];
        updatedViews[currentIndex] = {
          key: pathname,
          element: outlet,
          version: currentRefreshVersion,
        };
        return updatedViews;
      }

      return nextViews;
    });
  }, [cachedKeys, currentRefreshVersion, outlet, pathname]);

  useEffect(() => {
    setCachedViews((previous) =>
      previous.filter((view) => cachedKeys.includes(view.key) || view.key === pathname),
    );
  }, [cachedKeys, pathname]);

  const checkScrollButtons = () => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowScrollButtons({
      left: scrollLeft > 0,
      right: scrollLeft < scrollWidth - clientWidth - 1,
    });
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [tabs]);

  useEffect(() => {
    if (!activeKey || !tabsContainerRef.current) return;

    const activeTab = tabsContainerRef.current.querySelector(
      `[data-tab-key="${activeKey}"]`,
    );
    if (activeTab instanceof HTMLElement) {
      activeTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      window.setTimeout(checkScrollButtons, 250);
    }
  }, [activeKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const syncNavigateToActive = () => {
    const nextActiveKey = useTabsStore.getState().activeKey;
    if (nextActiveKey && nextActiveKey !== pathname) {
      navigate(nextActiveKey);
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;

    tabsContainerRef.current.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
    window.setTimeout(checkScrollButtons, 250);
  };

  const handleTabClick = (tab: TabItem) => {
    setActiveKey(tab.key);
    if (tab.path !== pathname) {
      navigate(tab.path);
    }
  };

  const handleRemove = (event: React.MouseEvent, key: string) => {
    event.stopPropagation();

    const targetTab = tabs.find((tab) => tab.key === key);
    if (!targetTab || targetTab.closable === false) return;

    removeTab(key);
    syncNavigateToActive();
  };

  const handleContextMenu = (event: React.MouseEvent, key: string) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      key,
    });
  };

  const handleMenuAction = (action: string) => {
    if (!contextMenu) return;

    const targetKey = contextMenu.key;

    switch (action) {
      case "refresh":
        setActiveKey(targetKey);
        navigate(targetKey);
        refreshTab(targetKey);
        break;
      case "closeCurrent":
        removeTab(targetKey);
        syncNavigateToActive();
        break;
      case "closeLeft":
        closeLeft(targetKey);
        syncNavigateToActive();
        break;
      case "closeRight":
        closeRight(targetKey);
        syncNavigateToActive();
        break;
      case "closeOther":
        closeOther(targetKey);
        syncNavigateToActive();
        break;
      case "closeAll":
        closeAll();
        syncNavigateToActive();
        break;
      default:
        break;
    }

    setContextMenu(null);
  };

  const contextTab = contextMenu
    ? tabs.find((tab) => tab.key === contextMenu.key)
    : null;
  const contextIndex = contextMenu
    ? tabs.findIndex((tab) => tab.key === contextMenu.key)
    : -1;
  const closableTabsCount = tabs.filter((tab) => tab.closable !== false).length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="relative flex h-10 items-center border-b border-[#e5eaf3] px-1 sm:px-2">
        {showScrollButtons.left && (
          <button
            type="button"
            className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[#8a94a6] transition hover:text-[#1677ff]"
            onClick={() => scrollTabs("left")}
          >
            <LeftOutlined style={{ fontSize: 11 }} />
          </button>
        )}

        <div
          ref={tabsContainerRef}
          className={`flex h-full flex-1 items-center gap-1 overflow-x-auto px-1 ${
            showScrollButtons.left ? "pl-8" : ""
          } ${showScrollButtons.right ? "pr-8" : ""}`}
          style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={checkScrollButtons}
        >
          {tabs.map((tab, index) => {
            const isActive = activeKey === tab.key;
            const isLast = index === tabs.length - 1;

            return (
              <div
                key={tab.key}
                data-tab-key={tab.key}
                className={`group relative flex h-7 min-w-[84px] max-w-[140px] sm:min-w-[104px] sm:max-w-[180px] flex-shrink-0 cursor-pointer items-center overflow-hidden rounded-sm transition-all duration-150 ${
                  isActive ? "z-10" : "z-0"
                }`}
                onClick={() => handleTabClick(tab)}
                onContextMenu={(event) => handleContextMenu(event, tab.key)}
              >
                <div
                  className={`absolute inset-0 rounded-sm border transition-all duration-150 ${
                    isActive
                      ? "border-[#bfdbff] bg-[#eaf3ff]"
                      : "border-transparent bg-transparent hover:border-[#d7e7ff] hover:bg-[#f3f8ff]"
                  }`}
                />
                <div className="relative flex w-full items-center gap-1 overflow-hidden px-1.5 sm:px-2">
                  {tab.icon && (
                    <span
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? "text-[#1677ff]" : "text-[#96a0b5]"
                      }`}
                    >
                      {renderIcon(tab.icon, 12)}
                    </span>
                  )}
                  <span
                    className={`flex-1 truncate text-xs transition-colors ${
                      isActive ? "font-medium text-[#1f2a3d]" : "text-[#5f6b7c]"
                    }`}
                  >
                    {tab.title}
                  </span>
                  {tab.closable !== false && (
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all duration-150 ${
                        isActive
                          ? "text-[#98a3b8] hover:bg-[#dbeafe] hover:text-[#1677ff]"
                          : "opacity-0 text-[#c0c7d4] group-hover:opacity-100 hover:bg-[#dbeafe] hover:text-[#1677ff]"
                      }`}
                      onClick={(event) => handleRemove(event, tab.key)}
                    >
                      <CloseOutlined style={{ fontSize: 9 }} />
                    </span>
                  )}
                </div>
                {!isLast && !isActive && (
                  <div className="absolute right-[-1px] top-1/2 h-3 w-px -translate-y-1/2 bg-[#e2e8f3]" />
                )}
              </div>
            );
          })}
        </div>

        {showScrollButtons.right && (
          <button
            type="button"
            className="absolute right-10 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-[#8a94a6] transition hover:text-[#1677ff]"
            onClick={() => scrollTabs("right")}
          >
            <RightOutlined style={{ fontSize: 11 }} />
          </button>
        )}

        <div className="relative ml-1 sm:ml-2 mr-1 flex h-full items-center">
          <div className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm text-[#7f8ba0] transition hover:bg-[#eef5ff] hover:text-[#1677ff]">
            <span className="relative block h-2 w-[14px]">
              <span className="absolute left-0 top-0.5 h-[6px] w-[6px] bg-current transition-all duration-200 group-hover:rotate-45" />
              <span className="absolute right-0 top-0.5 h-[6px] w-[6px] bg-current" />
            </span>
          </div>
        </div>

        {contextMenu?.visible && (
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[170px] rounded border border-[#d9e1ec] bg-white py-1 shadow-[0_10px_30px_rgba(31,42,61,0.12)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs text-[#4d5a6d] transition hover:bg-[#eef5ff] hover:text-[#1677ff]"
              onClick={() => handleMenuAction("refresh")}
            >
              <ReloadOutlined />
              刷新当前
            </button>
            <button
              type="button"
              className={`w-full px-3.5 py-2 text-left text-xs transition ${
                contextTab?.closable === false
                  ? "cursor-not-allowed text-[#c5ccd8]"
                  : "text-[#4d5a6d] hover:bg-[#eef5ff] hover:text-[#1677ff]"
              }`}
              onClick={() => {
                if (contextTab?.closable !== false) {
                  handleMenuAction("closeCurrent");
                }
              }}
            >
              关闭当前
            </button>
            <button
              type="button"
              className={`w-full px-3.5 py-2 text-left text-xs transition ${
                contextIndex <= 0
                  ? "cursor-not-allowed text-[#c5ccd8]"
                  : "text-[#4d5a6d] hover:bg-[#eef5ff] hover:text-[#1677ff]"
              }`}
              onClick={() => {
                if (contextIndex > 0) {
                  handleMenuAction("closeLeft");
                }
              }}
            >
              关闭左侧
            </button>
            <button
              type="button"
              className={`w-full px-3.5 py-2 text-left text-xs transition ${
                contextIndex === -1 || contextIndex === tabs.length - 1
                  ? "cursor-not-allowed text-[#c5ccd8]"
                  : "text-[#4d5a6d] hover:bg-[#eef5ff] hover:text-[#1677ff]"
              }`}
              onClick={() => {
                if (contextIndex !== -1 && contextIndex < tabs.length - 1) {
                  handleMenuAction("closeRight");
                }
              }}
            >
              关闭右侧
            </button>
            <button
              type="button"
              className={`w-full px-3.5 py-2 text-left text-xs transition ${
                tabs.length <= 1
                  ? "cursor-not-allowed text-[#c5ccd8]"
                  : "text-[#4d5a6d] hover:bg-[#eef5ff] hover:text-[#1677ff]"
              }`}
              onClick={() => {
                if (tabs.length > 1) {
                  handleMenuAction("closeOther");
                }
              }}
            >
              关闭其他
            </button>
            <div className="my-1 border-t border-[#e7edf5]" />
            <button
              type="button"
              className={`w-full px-3.5 py-2 text-left text-xs transition ${
                closableTabsCount === 0
                  ? "cursor-not-allowed text-[#c5ccd8]"
                  : "text-[#4d5a6d] hover:bg-[#eef5ff] hover:text-[#1677ff]"
              }`}
              onClick={() => {
                if (closableTabsCount > 0) {
                  handleMenuAction("closeAll");
                }
              }}
            >
              关闭全部
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        {cachedViews.map((view) => {
          const isActive = view.key === pathname;

          return (
            <div
              key={view.key}
              className="h-full min-h-0 p-1 sm:p-2 bg-[#F2F3F5]"
              style={{ display: isActive ? "block" : "none" }}
            >
              <div key={view.version} className="h-full min-h-0 p-2 sm:p-4 overflow-auto bg-[#fff]">
              {/* <div key={view.version} className="h-full min-h-0 overflow-auto"> */}
                {view.element}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NestTags;
