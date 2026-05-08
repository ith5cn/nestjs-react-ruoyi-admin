import { ConfigProvider, Spin } from 'antd';
import { useEffect } from 'react';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { BrowserRouter, Navigate, useRoutes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthGuard from '@/routers/AuthGuard';
import { publicRoutes, getProtectedLayoutRoute } from '@/routers';
import { staticRoutes } from '@/routers/staticRoutes';
import useAppStore from '@/store/useAppStore';
import usePermissionStore from '@/store/usePermissionStore';
import useUserStore from '@/store/useUserStore';

const RenderRoutes = () => {
  const { dynamicRoutes } = usePermissionStore();

  const layoutRoutes = dynamicRoutes.filter((route) => route.isLayout === 1);
  const fullScreenRoutes = dynamicRoutes.filter((route) => route.isLayout === 2);

  const protectedFullScreenRoutes = fullScreenRoutes.map((route) => ({
    ...route,
    element: <AuthGuard>{route.element}</AuthGuard>,
  }));

  const baseLayoutRoute = getProtectedLayoutRoute();
  baseLayoutRoute.children = [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    ...staticRoutes,
    ...layoutRoutes,
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ];

  return useRoutes([
    ...publicRoutes,
    baseLayoutRoute,
    ...protectedFullScreenRoutes,
  ]);
};

function App() {
  const { i18n } = useTranslation();
  const token = useUserStore((state) => state.token);
  const { isLoaded, initPermissions } = usePermissionStore();
  const { initSiteConfig } = useAppStore();

  useEffect(() => {
    if (token && !isLoaded) {
      void initPermissions();
      void initSiteConfig();
    }
  }, [token, isLoaded, initPermissions, initSiteConfig]);

  const antdLocale = i18n.language === 'en-US' ? enUS : zhCN;

  return (
    <ConfigProvider locale={antdLocale}>
      <BrowserRouter>
        <>
          <RenderRoutes />
          {token && !isLoaded ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <Spin size="large" description="正在初始化系统配置..." />
            </div>
          ) : null}
        </>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
