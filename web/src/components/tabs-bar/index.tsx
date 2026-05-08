import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import useTabsStore from "@/store/useTabsStore";
import { renderIcon } from "@/utils/routeUtils";

const TabsBar: React.FC = () => {
  const navigate = useNavigate();
  const {
    tabs,
    activeKey,
    setActiveKey,
    removeTab,
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

  const [showScrollButtons, setShowScrollButtons] = useState({
    left: false,
    right: false,
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowScrollButtons({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 1,
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [tabs]);

  useEffect(() => {
    if (activeKey && tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.querySelector(
        `[data-tab-key="${activeKey}"]`,
      );
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        setTimeout(checkScrollButtons, 300);
      }
    }
  }, [activeKey]);

  const scroll = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    const tab = tabs.find((t) => t.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  const handleRemove = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    const tab = tabs.find((t) => t.key === key);
    if (tab?.closable === false) return;

    const currentIndex = tabs.findIndex((t) => t.key === key);
    const isActive = activeKey === key;

    removeTab(key);

    if (isActive) {
      const remainingTabs = tabs.filter((t) => t.key !== key);
      if (remainingTabs.length > 0) {
        const newIndex = Math.min(currentIndex, remainingTabs.length - 1);
        const nextTab = remainingTabs[newIndex];
        setActiveKey(nextTab.key);
        navigate(nextTab.path);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      key,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleMenuClick = (action: string) => {
    if (!contextMenu) return;

    const { key } = contextMenu;
    const tab = tabs.find((t) => t.key === key);

    switch (action) {
      case "closeCurrent":
        if (tab?.closable !== false) {
          const currentIndex = tabs.findIndex((t) => t.key === key);
          const isActive = activeKey === key;
          removeTab(key);
          if (isActive) {
            const remainingTabs = tabs.filter((t) => t.key !== key);
            if (remainingTabs.length > 0) {
              const newIndex = Math.min(currentIndex, remainingTabs.length - 1);
              const nextTab = remainingTabs[newIndex];
              setActiveKey(nextTab.key);
              navigate(nextTab.path);
            }
          }
        }
        break;
      case "closeLeft":
        closeLeft(key);
        break;
      case "closeRight":
        closeRight(key);
        break;
      case "closeOther":
        closeOther(key);
        if (tab) {
          navigate(tab.path);
        }
        break;
      case "closeAll":
        closeAll();
        const remaining = tabs.filter((t) => t.closable === false);
        if (remaining.length > 0) {
          navigate(remaining[0].path);
        }
        break;
    }

    closeContextMenu();
  };

  const contextTab = contextMenu
    ? tabs.find((t) => t.key === contextMenu.key)
    : null;
  const contextIndex = contextMenu
    ? tabs.findIndex((t) => t.key === contextMenu.key)
    : -1;

  return (
    <div className="bg-[#d6e3fb] relative flex items-center h-10">
      {showScrollButtons.left && (
        <div
          className="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-[#aec7f6] rounded flex-shrink-0 mx-1"
          onClick={() => scroll("left")}
        >
          <LeftOutlined style={{ fontSize: 12, color: "#5f6368" }} />
        </div>
      )}

      <div
        ref={tabsContainerRef}
        className="flex items-end flex-1 h-full px-1"
        style={{
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={checkScrollButtons}
      >
        {tabs.map((tab, index) => {
          const isActive = activeKey === tab.key;
          const isLast = index === tabs.length - 1;

          return (
            <div
              key={tab.key}
              data-tab-key={tab.key}
              className={`
                group relative flex items-center h-8 min-w-[120px] max-w-[200px]
                cursor-pointer transition-all duration-150 flex-shrink-0
                ${isActive ? "z-10" : "z-0"}
              `}
              onClick={() => handleTabClick(tab.key)}
              onContextMenu={(e) => handleContextMenu(e, tab.key)}
            >
              <div
                className={`
                  absolute inset-0 rounded-t-lg
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.1)]"
                      : "bg-transparent hover:bg-[#aec7f6]"
                  }
                `}
              />
              <div className="relative flex items-center gap-2 px-3 w-full overflow-hidden">
                {tab.icon && (
                  <span className="flex-shrink-0 text-gray-500">
                    {renderIcon(tab.icon, 14)}
                  </span>
                )}
                <span className="text-sm text-gray-700 truncate flex-1">
                  {tab.title}
                </span>
                {tab.closable !== false && (
                  <span
                    className={`
                      flex-shrink-0 w-5 h-5 flex items-center justify-center rounded
                      transition-all duration-150
                      ${
                        isActive
                          ? "hover:bg-gray-200"
                          : "opacity-0 group-hover:opacity-100 hover:bg-gray-300/50"
                      }
                    `}
                    onClick={(e) => handleRemove(e, tab.key)}
                  >
                    <CloseOutlined style={{ fontSize: 10, color: "#5f6368" }} />
                  </span>
                )}
              </div>
              {!isLast && !isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-4 bg-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      {showScrollButtons.right && (
        <div
          className="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-[#aec7f6] rounded flex-shrink-0 mx-1"
          onClick={() => scroll("right")}
        >
          <RightOutlined style={{ fontSize: 12, color: "#5f6368" }} />
        </div>
      )}

      {contextMenu?.visible && (
        <div
          ref={menuRef}
          className="fixed bg-white shadow-lg rounded-lg py-1 z-50 border border-gray-200"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: 120,
          }}
        >
          <div
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              contextTab?.closable === false
                ? "text-gray-400 cursor-not-allowed"
                : ""
            }`}
            onClick={() => {
              if (contextTab?.closable !== false) {
                handleMenuClick("closeCurrent");
              }
            }}
          >
            关闭当前
          </div>
          <div
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              contextIndex <= 0 ? "text-gray-400 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (contextIndex > 0) {
                handleMenuClick("closeLeft");
              }
            }}
          >
            关闭左边
          </div>
          <div
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              contextIndex === -1 || contextIndex === tabs.length - 1
                ? "text-gray-400 cursor-not-allowed"
                : ""
            }`}
            onClick={() => {
              if (contextIndex !== -1 && contextIndex < tabs.length - 1) {
                handleMenuClick("closeRight");
              }
            }}
          >
            关闭右边
          </div>
          <div
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              tabs.length <= 1 ? "text-gray-400 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (tabs.length > 1) {
                handleMenuClick("closeOther");
              }
            }}
          >
            关闭其他
          </div>
          <div className="border-t border-gray-200 my-1" />
          <div
            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              tabs.filter((t) => t.closable !== false).length === 0
                ? "text-gray-400 cursor-not-allowed"
                : ""
            }`}
            onClick={() => {
              if (tabs.filter((t) => t.closable !== false).length > 0) {
                handleMenuClick("closeAll");
              }
            }}
          >
            关闭所有
          </div>
        </div>
      )}
    </div>
  );
};

export default TabsBar;
