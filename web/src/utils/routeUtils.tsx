import React, { lazy, Suspense } from "react";
import * as AntdIcons from "@ant-design/icons";
import * as LucideIcons from "lucide-react";
import { Navigate } from "react-router-dom";
import type { SysMenu } from "@/types/system";

const modules = import.meta.glob("../pages/**/*.tsx");

export interface RouteTabMeta {
  title: string;
  icon?: string;
  affix?: boolean;
  keepAlive?: boolean;
}

export interface AppRouteRecord {
  path: string;
  name?: string;
  hideInMenu?: boolean;
  icon?: React.ReactNode;
  meta?: RouteTabMeta;
  isLayout?: number;
  isLink?: boolean;
  element?: React.ReactNode;
}

export const renderIcon = (iconName?: string, size: number = 16) => {
  if (!iconName) return null;
  if (iconName.startsWith("lucide:")) {
    const name = iconName.replace("lucide:", "");
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? React.createElement(IconComponent, { size }) : null;
  }
  const IconComponent = (AntdIcons as any)[iconName];
  return IconComponent
    ? React.createElement(IconComponent, { style: { fontSize: size } })
    : null;
};

export const loadPageElement = (componentName: string) => {
  const componentPath = `../pages/${componentName}.tsx`;
  const DynamicComponent = lazy(() => {
    const loader = modules[componentPath];
    if (!loader) {
      console.warn(`组件路径未找到: ${componentPath}`);
      return Promise.resolve({
        default: () => (
          <div className="p-4 text-red-500">
            组件尚未创建或找不到: {componentName}
          </div>
        ),
      });
    }
    return loader() as any;
  });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10">
          Loading...
        </div>
      }
    >
      <DynamicComponent />
    </Suspense>
  );
};

// 3. 核心转换函数 (将树形菜单扁平化为一维路由列表)
export const transformMenuToRoutes = (menus: SysMenu[]) => {
  const flatRoutes: AppRouteRecord[] = [];

  const traverse = (list: SysMenu[]) => {
    list.forEach((item) => {
      if (item.status !== 1) return; // 仅处理状态正常
      if (item.type === "B") return; // 剔除按钮

      // 统一绝对路径前缀
      const absolutePath = item.route.startsWith("/")
        ? item.route
        : `/${item.route}`;

      const route: AppRouteRecord = {
        path: absolutePath,
        name: item.name,
        hideInMenu: item.isHidden === 1,
        icon: renderIcon(item.icon),
        meta: {
          title: item.name,
          icon: item.icon,
          affix: absolutePath === "/dashboard",
          keepAlive: true,
        },
        isLayout: item.isLayout,
      };

      // 处理特殊配置组件
      // 处理功能性路由
      if (item.type === "L") {
        route.isLink = true;
        flatRoutes.push(route);
      } else if (item.type === "I") {
        route.element = (
          <iframe
            src={item.route}
            style={{ width: "100%", height: "100vh", border: "none" }}
            title={item.name}
          />
        );
        flatRoutes.push(route);
      } else {
        // 处理普通组件 (M) 或结构性目录
        if (item.component) {
          route.element = loadPageElement(item.component);
        } else {
          // 对于仅有路由而没有挂载具体 component 字符串的分类目录节点，分配一个占位符
          route.element = (
            <div className="p-4 flex items-center justify-center text-gray-400">
              父级目录，无内容展示
            </div>
          );
        }
        flatRoutes.push(route);
      }

      // 处理重定向
      if (item.redirect) {
        flatRoutes.push({
          path: absolutePath,
          meta: route.meta,
          isLayout: item.isLayout,
          element: <Navigate to={item.redirect} replace />,
        });
      }

      // 递归子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    });
  };

  traverse(menus);
  return flatRoutes;
};
