import React, { useState, useMemo, useRef } from "react";
import { Input, Button, Modal, Tabs, Input as AntInput, Empty } from "antd";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as AntdIcons from "@ant-design/icons";
import * as LucideIcons from "lucide-react";

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const antdIconNames = Object.keys(AntdIcons).filter((key) => {
  const icon = (AntdIcons as any)[key];
  return icon && typeof icon.render === "function" && key.endsWith("Outlined");
});

const lucideIconNames = Object.keys(LucideIcons).filter((key) => {
  const icon = (LucideIcons as any)[key];
  return (
    icon &&
    typeof icon.render === "function" &&
    !key.endsWith("Icon") &&
    key !== "createLucideIcon" &&
    key !== "default"
  );
});

const renderAntdIcon = (name: string) => {
  const IconComponent = (AntdIcons as any)[name];
  return IconComponent
    ? React.createElement(IconComponent, { style: { fontSize: 24 } })
    : null;
};

const renderLucideIcon = (name: string) => {
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent
    ? React.createElement(IconComponent, { size: 24 })
    : null;
};

const COLUMN_COUNT = 8;
const ITEM_HEIGHT = 80;
const ITEM_WIDTH = 88;

const VirtualIconGrid: React.FC<{
  icons: string[];
  type: "antd" | "lucide";
  onSelect: (name: string, type: "antd" | "lucide") => void;
}> = ({ icons, type, onSelect }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(icons.length / COLUMN_COUNT);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  const renderIcon = (name: string) => {
    return type === "lucide" ? renderLucideIcon(name) : renderAntdIcon(name);
  };

  if (icons.length === 0) {
    return <Empty style={{ padding: 40 }} />;
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: 400,
        overflow: "auto",
        padding: 8,
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * COLUMN_COUNT;
          const rowIcons = icons.slice(startIndex, startIndex + COLUMN_COUNT);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                gap: 8,
              }}
            >
              {rowIcons.map((name) => (
                <div
                  key={name}
                  style={{
                    width: ITEM_WIDTH,
                    height: ITEM_HEIGHT,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    cursor: "pointer",
                    borderRadius: 8,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  onClick={() => onSelect(name, type)}
                >
                  {renderIcon(name)}
                  <span
                    style={{
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: "center",
                      wordBreak: "break-all",
                      maxWidth: ITEM_WIDTH - 16,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {type === "antd" ? name.replace("Outlined", "") : name}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("antd");

  const handleSelect = (iconName: string, type: "antd" | "lucide") => {
    const finalName = type === "lucide" ? `lucide:${iconName}` : iconName;
    onChange?.(finalName);
    setVisible(false);
    setSearchText("");
  };

  const renderIcon = (iconName: string) => {
    if (!iconName) return null;
    if (iconName.startsWith("lucide:")) {
      const name = iconName.replace("lucide:", "");
      return renderLucideIcon(name);
    }
    return renderAntdIcon(iconName);
  };

  const filteredAntdIcons = useMemo(() => {
    if (!searchText) return antdIconNames;
    return antdIconNames.filter((name) =>
      name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText]);

  const filteredLucideIcons = useMemo(() => {
    if (!searchText) return lucideIconNames;
    return lucideIconNames.filter((name) =>
      name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText]);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || "请选择图标"}
        style={{ flex: 1 }}
      />
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          background: "#fafafa",
        }}
      >
        {value && renderIcon(value)}
      </div>
      <Button onClick={() => setVisible(true)}>选择</Button>

      <Modal
        title="选择图标"
        open={visible}
        onCancel={() => {
          setVisible(false);
          setSearchText("");
        }}
        footer={null}
        width={800}
      >
        <AntInput
          placeholder="搜索图标..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<AntdIcons.SearchOutlined />}
          allowClear
        />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "antd",
              label: `Ant Design Icons (${antdIconNames.length})`,
              children: (
                <VirtualIconGrid
                  icons={filteredAntdIcons}
                  type="antd"
                  onSelect={handleSelect}
                />
              ),
            },
            {
              key: "lucide",
              label: `Lucide Icons (${lucideIconNames.length})`,
              children: (
                <VirtualIconGrid
                  icons={filteredLucideIcons}
                  type="lucide"
                  onSelect={handleSelect}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default IconPicker;
