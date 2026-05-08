import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingFilled,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import useUserStore from "@/store/useUserStore";
import ImageUpload from "@/components/image-upload";
import FileUpload from "@/components/file-upload";
import WangEditor from "@/components/wang-editor";
import {
  configBatchUpdateApi,
  configGroupDeleteApi,
  getConfigGroupListApi,
  getConfigListApi,
} from "@/api/system/config";
import ConfigGroupEdit, { type ConfigGroupEditRef } from "./components/config-group-edit";
import ConfigItemEdit, { type ConfigItemEditRef } from "./components/config-item-edit";
import ConfigManageModal, { type ConfigManageModalRef } from "./components/config-manage-modal";
import { storageModeGroups } from "./components/config-constants";

interface ConfigGroupRecord {
  id: number;
  name: string;
  code: string;
  remark?: string;
}

interface ConfigRecord {
  id: number;
  group_id: number;
  name: string;
  key: string;
  value: any;
  input_type: string;
  config_select_data?: any;
  sort?: number;
  remark?: string;
  display?: boolean;
}

const reservedGroupIds = [1, 2, 3];

const parseOptions = (value: any) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const extractConfigRows = (payload: any): ConfigRecord[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const applyUploadModeDisplay = (rows: ConfigRecord[]) => {
  const uploadModeItem = rows.find((item) => item.key === "upload_mode");
  if (!uploadModeItem) return rows;

  const uploadMode = Number(uploadModeItem.value);
  return rows.map((item) => {
    const belongsStoragePrefix = storageModeGroups.some(({ prefix }) => item.key?.includes(prefix));
    if (!belongsStoragePrefix) {
      return { ...item, display: item.display !== false };
    }

    const currentGroup = storageModeGroups.find(({ mode }) => mode === uploadMode);
    return {
      ...item,
      display: currentGroup ? item.key.includes(currentGroup.prefix) : false,
    };
  });
};

const normalizeConfigRows = (rows: ConfigRecord[]) => {
  const nextRows = rows.map((item) => {
    const belongsStoragePrefix = storageModeGroups.some(({ prefix }) => item.key?.includes(prefix));
    return {
      ...item,
      display: belongsStoragePrefix ? false : true,
    };
  });
  return applyUploadModeDisplay(nextRows);
};

const ConfigIndex = () => {
  const permissions = useUserStore((state) => state.permissions);
  const groupEditRef = useRef<ConfigGroupEditRef>(null);
  const configItemEditRef = useRef<ConfigItemEditRef>(null);
  const manageConfigRef = useRef<ConfigManageModalRef>(null);

  const [groups, setGroups] = useState<ConfigGroupRecord[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [configRows, setConfigRows] = useState<ConfigRecord[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const hasAuth = (codes: string[]) => {
    if (!codes.length) return true;
    if (permissions.includes("*")) return true;
    return codes.some((code) => permissions.includes(code));
  };

  const currentGroup = useMemo(
    () => groups.find((item) => item.id === currentGroupId) || null,
    [groups, currentGroupId],
  );

  const loadConfigsByGroupId = async (groupId: number) => {
    if (!groupId) {
      setConfigRows([]);
      return;
    }

    setLoading(true);
    try {
      const res = await getConfigListApi({
        group_id: groupId,
        orderBy: "sort",
        orderType: "DESC",
      });
      setConfigRows(normalizeConfigRows(extractConfigRows(res.data)));
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async (preferredGroupId?: number) => {
    const res = await getConfigGroupListApi({});
    const rows = Array.isArray(res.data) ? res.data : [];
    setGroups(rows);

    const nextGroup =
      rows.find((item: ConfigGroupRecord) => item.id === preferredGroupId) ||
      rows.find((item: ConfigGroupRecord) => item.id === currentGroupId) ||
      rows[0];

    const nextGroupId = nextGroup?.id || 0;
    setCurrentGroupId(nextGroupId);
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  useEffect(() => {
    void loadConfigsByGroupId(currentGroupId);
  }, [currentGroupId]);

  const visibleRows = useMemo(
    () => configRows.filter((item) => item.display !== false),
    [configRows],
  );

  const handleValueChange = (rowId: number, value: any) => {
    setConfigRows((prev) => {
      const next = prev.map((item) => (item.id === rowId ? { ...item, value } : item));
      const changed = next.find((item) => item.id === rowId);
      if (changed?.key === "upload_mode") {
        return applyUploadModeDisplay(next);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!currentGroupId || configRows.length === 0) return;
    await configBatchUpdateApi({
      group_id: currentGroupId,
      config: configRows.map((item) => ({
        id: item.id,
        group_id: item.group_id,
        name: item.name,
        key: item.key,
        value: item.value,
        input_type: item.input_type,
        config_select_data: item.config_select_data,
        sort: item.sort,
        remark: item.remark,
      })),
    });
    message.success("保存成功");
    await loadConfigsByGroupId(currentGroupId);
  };

  const handleDeleteGroup = async () => {
    if (!currentGroup) return;
    if (reservedGroupIds.includes(currentGroup.id)) {
      message.info("系统核心配置分组不允许删除");
      return;
    }
    if (deleteConfirmName !== currentGroup.name) {
      message.error("输入的分组名称不正确");
      return;
    }
    await configGroupDeleteApi(currentGroup.id);
    message.success("删除成功");
    setDeleteOpen(false);
    setDeleteConfirmName("");
    await loadGroups();
  };

  const renderConfigInput = (item: ConfigRecord) => {
    if (item.input_type === "select") {
      return (
        <Select
          value={item.value}
          options={parseOptions(item.config_select_data)}
          placeholder={`请选择${item.name}`}
          onChange={(value) => handleValueChange(item.id, value)}
          allowClear
        />
      );
    }

    if (item.input_type === "radio") {
      return (
        <Radio.Group
          value={item.value}
          options={parseOptions(item.config_select_data)}
          onChange={(e) => handleValueChange(item.id, e.target.value)}
        />
      );
    }

    if (item.input_type === "textarea") {
      return (
        <Input.TextArea
          rows={4}
          value={item.value}
          placeholder={`请输入${item.name}`}
          onChange={(e) => handleValueChange(item.id, e.target.value)}
        />
      );
    }

    if (item.input_type === "uploadImage") {
      return <ImageUpload value={item.value} onChange={(value) => handleValueChange(item.id, value)} />;
    }

    if (item.input_type === "uploadFile") {
      return <FileUpload value={item.value} onChange={(value) => handleValueChange(item.id, value)} />;
    }

    if (item.input_type === "wangEditor") {
      return <WangEditor value={item.value || ""} onChange={(value) => handleValueChange(item.id, value)} />;
    }

    return (
      <Input
        value={item.value}
        placeholder={`请输入${item.name}`}
        onChange={(e) => handleValueChange(item.id, e.target.value)}
      />
    );
  };

  return (
    <>
      <div className="flex gap-4">
        <div style={{ width: "38%" }}>
          <Card
            title="配置分组"
            extra={
              hasAuth(["system/config-group/create"]) ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => groupEditRef.current?.open("add")}
                >
                  新增分组
                </Button>
              ) : null
            }
          >
            {groups.length === 0 ? (
              <Empty description="暂无配置分组" />
            ) : (
              <List
                dataSource={groups}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      hasAuth(["system/config-group/update"]) ? (
                        <Button
                          key="edit"
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => groupEditRef.current?.open("edit", item)}
                        >
                          编辑
                        </Button>
                      ) : null,
                      hasAuth(["system/config-group/destroy"]) ? (
                        <Button
                          key="delete"
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setCurrentGroupId(item.id);
                            setDeleteOpen(true);
                          }}
                        >
                          删除
                        </Button>
                      ) : null,
                    ].filter(Boolean)}
                  >
                    <Button
                      type={currentGroupId === item.id ? "primary" : "default"}
                      ghost={currentGroupId !== item.id}
                      onClick={() => setCurrentGroupId(item.id)}
                    >
                      {item.name} ({item.code})
                    </Button>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

        <div style={{ width: "72%" }}>
          <Card
            title={currentGroup?.name || "配置列表"}
            extra={
              <Space>
                {currentGroup && hasAuth(["system/config/create"]) ? (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => configItemEditRef.current?.open("add", { group_id: currentGroup.id })}
                  >
                    新增配置
                  </Button>
                ) : null}
                {currentGroup && hasAuth(["system/config/create", "system/config/update", "system/config/destroy"]) ? (
                  <Button
                    icon={<SettingFilled />}
                    onClick={() => manageConfigRef.current?.open(currentGroup.id)}
                  >
                    管理配置项
                  </Button>
                ) : null}
              </Space>
            }
          >
            <Spin spinning={loading}>
              {!currentGroup ? (
                <Empty description="请先选择配置分组" />
              ) : visibleRows.length === 0 ? (
                <Empty description="当前分组暂无配置项" />
              ) : (
                <Form layout="vertical">
                  {visibleRows.map((item) => (
                    <Form.Item key={item.id} label={item.name} extra={item.remark}>
                      {renderConfigInput(item)}
                    </Form.Item>
                  ))}
                  {hasAuth(["system/config/update"]) ? (
                    <Form.Item>
                      <Space>
                        <Button type="primary" onClick={handleSave}>
                          保存修改
                        </Button>
                      </Space>
                    </Form.Item>
                  ) : null}
                </Form>
              )}
            </Spin>
          </Card>
        </div>
      </div>

      <Modal
        title="危险操作"
        open={deleteOpen}
        onOk={handleDeleteGroup}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteConfirmName("");
        }}
      >
        <div style={{ marginBottom: 12 }}>
          确定要删除 <span style={{ color: "#ff4d4f", fontWeight: 700 }}>{currentGroup?.name}</span> 配置分组吗？
        </div>
        <div style={{ marginBottom: 12 }}>
          此操作会删除分组以及分组下全部配置项，请输入分组名称确认删除。
        </div>
        <Input
          value={deleteConfirmName}
          placeholder={currentGroup?.name ? `请输入 ${currentGroup.name}` : "请输入分组名称"}
          onChange={(e) => setDeleteConfirmName(e.target.value)}
        />
      </Modal>

      <ConfigGroupEdit
        ref={groupEditRef}
        onSuccess={async () => {
          await loadGroups(currentGroupId || undefined);
        }}
      />

      <ConfigItemEdit
        ref={configItemEditRef}
        onSuccess={async () => {
          await loadConfigsByGroupId(currentGroupId);
        }}
      />

      <ConfigManageModal
        ref={manageConfigRef}
        onClose={async () => {
          await loadConfigsByGroupId(currentGroupId);
        }}
      />
    </>
  );
};

export default ConfigIndex;
