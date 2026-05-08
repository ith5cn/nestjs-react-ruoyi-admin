import React, { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Grid, Layout as AntdLayout, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import usePermissionStore from "@/store/usePermissionStore";
import useAppStore from "@/store/useAppStore";
import { renderIcon } from "@/utils/routeUtils";
import NestOperation from "../nest-operation";
import NestTags from "@/layout/nest-tags";

const { Header, Sider, Content } = AntdLayout;

const BasicLayout: React.FC = () => {
  const { menuTree } = usePermissionStore();
  const { siderCollapsed, setSiderCollapsed, siteConfig } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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

  const codeToParentCodeMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    const buildMap = (nodes: any[], parentCodes: string[] = []) => {
      for (const node of nodes) {
        if (node.status !== 1 || node.type === "B") continue;
        const currentCodes =
          node.isHidden !== 1 ? [...parentCodes, node.code] : parentCodes;
        if (node.code) map[node.code] = parentCodes;
        if (node.children?.length) buildMap(node.children, currentCodes);
      }
    };
    buildMap(menuTree);
    return map;
  }, [menuTree]);

  const selectedCode = routeToCodeMap[location.pathname] || "";
  const openCodes = codeToParentCodeMap[selectedCode] || [];

  const renderMenuItems = (nodes: any[]): any[] => {
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
          result.push(...renderMenuItems(node.children));
        }
        continue;
      }

      if (node.children && node.children.length > 0) {
        const childItems = renderMenuItems(node.children);
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

  const menuItems = renderMenuItems(menuTree);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);


  return (
    <AntdLayout className="h-screen">
      {!isMobile && (
        <Sider
          theme="light"
          breakpoint="lg"
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          collapsedWidth={0}
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <div
            className="h-16 flex items-center justify-center font-bold text-lg border-b border-gray-200"
            style={{ color: "#1978e5" }}
          >
            {siteConfig?.site_name}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedCode ? [selectedCode] : []}
            defaultOpenKeys={openCodes}
            items={menuItems}
          />
        </Sider>
      )}
      <AntdLayout className="flex flex-col min-h-0">
        <Header
          className="px-3 sm:px-4 flex justify-between items-center shadow-sm z-10"
          style={{ background: "#fff" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              />
            )}
            <span className="truncate text-sm font-medium text-[#1978e5] sm:hidden">
              {siteConfig?.site_name}
            </span>
          </div>
          <NestOperation />
        </Header>
        <Content className="m-2 sm:m-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded shadow bg-white">
          <NestTags />
        </Content>
      </AntdLayout>
      <Drawer
        title={siteConfig?.site_name}
        placement="left"
        width={260}
        open={isMobile && mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedCode ? [selectedCode] : []}
          defaultOpenKeys={openCodes}
          items={menuItems}
        />
      </Drawer>
    </AntdLayout>
  );
};

export default BasicLayout;
