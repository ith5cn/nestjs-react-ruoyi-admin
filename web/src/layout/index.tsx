import React from "react";
import useAppStore from "@/store/useAppStore";
import BasicLayout from "./components/basic";
import MixedLayout from "./components/mixed";

const Layout: React.FC = () => {
  const { layoutMode } = useAppStore();

  if (layoutMode === "mixed") {
    return <MixedLayout />;
  }

  return <BasicLayout />;
};

export default Layout;
