import React from "react";
import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, ClearOutlined } from "@ant-design/icons";
import useUserStore from "@/store/useUserStore";
import type { MenuProps } from "antd";

const NestOperation: React.FC = () => {
  const { logout, userInfo } = useUserStore();
  const navigate = useNavigate();

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const items: MenuProps["items"] = [
    {
      key: "clearCache",
      label: "清除缓存",
      icon: <ClearOutlined />,
      onClick: handleClearCache,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出系统",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <div className="cursor-pointer hover:bg-gray-100 px-3 sm:px-4 py-2 rounded transition max-w-[140px] sm:max-w-none truncate">
        {userInfo?.username || userInfo?.name || "用户"}
      </div>
    </Dropdown>
  );
};

export default NestOperation;
