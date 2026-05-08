import React, { useMemo, useState, useEffect } from "react";
import { Button, Drawer, Grid, Layout as AntdLayout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import usePermissionStore from "@/store/usePermissionStore";
import useAppStore from "@/store/useAppStore";
import { renderIcon } from "@/utils/routeUtils";
import NestOperation from "../nest-operation";
import NestTags from "@/layout/nest-tags";
import "./index.css";
import { MenuOutlined } from "@ant-design/icons";

const { Header, Sider } = AntdLayout;

const MixedLayout: React.FC = () => {
  const { menuTree } = usePermissionStore();
  const { siderCollapsed, setSiderCollapsed, siteConfig } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [activeTopMenu, setActiveTopMenu] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const topMenus = useMemo(() => {
    return menuTree.filter(
      (node: any) =>
        node.status === 1 && node.type !== "B" && node.isHidden !== 1,
    );
  }, [menuTree]);

  const routeToCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    const buildMap = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.route && node.code) {
          const absRoute = node.route.startsWith("/")
            ? node.route
            : `/${node.route}`;
          map[absRoute] = node.code;
        }
        if (node.children?.length) buildMap(node.children);
      }
    };
    buildMap(menuTree);
    return map;
  }, [menuTree]);

  const codeToTopMenuMap = useMemo(() => {
    const map: Record<string, string> = {};
    const buildMap = (nodes: any[], topMenuCode: string = "") => {
      for (const node of nodes) {
        const isTopLevel = menuTree.some((n: any) => n.code === node.code);
        const currentTopCode = isTopLevel ? node.code : topMenuCode;
        if (node.code) map[node.code] = currentTopCode;
        if (node.children?.length) buildMap(node.children, currentTopCode);
      }
    };
    buildMap(menuTree);
    return map;
  }, [menuTree]);

  const selectedCode = routeToCodeMap[location.pathname] || "";
  const currentTopMenu = codeToTopMenuMap[selectedCode];

  useEffect(() => {
    if (currentTopMenu) {
      setActiveTopMenu(currentTopMenu);
    }
  }, [currentTopMenu]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const sideMenuData = useMemo(() => {
    const topNode = topMenus.find((n: any) => n.code === activeTopMenu);
    return topNode?.children || [];
  }, [topMenus, activeTopMenu]);

  const renderSideMenuItems = (nodes: any[]): any[] => {
    const result: any[] = [];

    for (const node of nodes) {
      if (node.status !== 1 || node.type === "B") continue;

      const isExternalLink = node.type === "L";
      const absoluteRoute =
        node.route && (node.route.startsWith("/") || isExternalLink)
          ? node.route
          : `/${node.route || ""}`;

      if (node.isHidden === 1) {
        if (node.children && node.children.length > 0) {
          result.push(...renderSideMenuItems(node.children));
        }
        continue;
      }

      if (node.children && node.children.length > 0) {
        const childItems = renderSideMenuItems(node.children);
        if (childItems.length > 0) {
          result.push({
            key: node.code,
            icon: renderIcon(node.icon),
            label: node.name,
            children: childItems,
          });
          continue;
        }
      }

      result.push({
        key: node.code,
        icon: renderIcon(node.icon),
        label: node.name,
        onClick: () => {
          if (isExternalLink) {
            window.open(node.route, "_blank");
          } else {
            navigate(absoluteRoute);
          }
        },
      });
    }

    return result;
  };

  const topMenuItems = topMenus.map((node: any) => ({
    key: node.code,
    icon: renderIcon(node.icon),
    label: node.name,
  }));

  const sideMenuItems = renderSideMenuItems(sideMenuData);

  const handleTopMenuClick = ({ key }: { key: string }) => {
    setActiveTopMenu(key);
    const topNode = topMenus.find((n: any) => n.code === key);
    if (topNode?.component) {
      const absoluteRoute = topNode.route?.startsWith("/")
        ? topNode.route
        : `/${topNode.route || ""}`;
      navigate(absoluteRoute);
    }
  };

  return (
    <AntdLayout className="h-screen">
      <Header
        className="px-3 sm:px-4 flex items-center shadow-sm z-10"
        style={{ background: "#fff" }}
      >
        <div
          className="font-bold text-base sm:text-lg mr-2 sm:mr-8 flex items-center"
          style={{ color: "#1978e5", whiteSpace: "nowrap" }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="mr-1"
              aria-label="Open menu"
            />
          )}
          {siteConfig?.site_name}
        </div>
        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={activeTopMenu ? [activeTopMenu] : []}
            items={topMenuItems}
            onClick={handleTopMenuClick}
            style={{ flex: 1, border: "none", minWidth: 0 }}
            className="header-menu"
          />
        )}
        {isMobile && <div className="flex-1" />}
        <NestOperation />
      </Header>
      <AntdLayout className="flex flex-row min-h-0">
        {!isMobile && sideMenuItems.length > 0 && (
          <Sider
            theme="light"
            width={200}
            collapsed={siderCollapsed}
            onCollapse={setSiderCollapsed}
            collapsedWidth={0}
            style={{ borderRight: "1px solid #f0f0f0" }}
          >
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={selectedCode ? [selectedCode] : []}
              items={sideMenuItems}
            />
          </Sider>
        )}
        <AntdLayout className="flex min-h-0 flex-col">
          <NestTags />
          {/* <Content className="m-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded shadow bg-white">
           
          </Content> */}
        </AntdLayout>
      </AntdLayout>
      <Drawer
        title={siteConfig?.site_name}
        placement="left"
        width={280}
        open={isMobile && mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <div className="border-b border-[#f0f0f0] px-3 py-2">
          <Menu
            mode="inline"
            selectedKeys={activeTopMenu ? [activeTopMenu] : []}
            items={topMenuItems}
            onClick={({ key }) => handleTopMenuClick({ key })}
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedCode ? [selectedCode] : []}
          items={sideMenuItems}
        />
      </Drawer>
    </AntdLayout>
  );
};

export default MixedLayout;
