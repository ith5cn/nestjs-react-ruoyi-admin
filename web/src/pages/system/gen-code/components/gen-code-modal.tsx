import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Button, Empty, Form, message, Modal, Tabs, Tag, type TabsProps } from "antd";
import { dictTypeListApi } from "@/api/system/dict";
import {
  genCodeDetailApi,
  genCodeGenerateApi,
  genCodePreviewApi,
  genCodeUpdateApi,
} from "@/api/system/gencode";
import { menuListApi } from "@/api/system/menu";
import GencodeColumns from "./gencode-columns";
import GencodeSetting from "./gencode-setting";

export interface GencodeColumnRecord {
  id?: number;
  table_id?: number;
  column_name: string;
  column_comment?: string;
  column_type?: string;
  default_value?: string;
  is_pk?: number;
  is_required: number;
  is_insert?: number;
  is_edit: number;
  is_list: number;
  is_query: number;
  is_sort: number;
  query_type: string;
  view_type: string;
  dict_type?: string;
  sort: number;
  remark?: string;
}

export interface GencodeModalRef {
  open: (data: any) => void;
  preview: (data: any) => void;
}

interface GencodeModalProps {
  onSuccess?: () => void;
}

interface PreviewFileRecord {
  path: string;
  content: string;
  group: "backend" | "frontend";
}

const renderPreviewCode = (content: string) => (
  <pre
    style={{
      margin: 0,
      maxHeight: "65vh",
      overflow: "auto",
      padding: 16,
      background: "#0f172a",
      color: "#e2e8f0",
      borderRadius: 8,
    }}
  >
    <code>{content}</code>
  </pre>
);

const filterMenuTree = (nodes: any[]): any[] => {
  return nodes
    .map((node) => ({
      ...node,
      children: filterMenuTree(node.children || []),
    }))
    .filter((node) => node.type === "M");
};

const GencodeModal = forwardRef<GencodeModalRef, GencodeModalProps>(({ onSuccess }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [columns, setColumns] = useState<GencodeColumnRecord[]>([]);
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [dictTypeOptions, setDictTypeOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<PreviewFileRecord[]>([]);
  const [form] = Form.useForm();

  const loadDetail = async (id: number) => {
    const [detailRes, menuRes, dictRes] = await Promise.all([
      genCodeDetailApi(id),
      menuListApi({}),
      dictTypeListApi({ page: 1, limit: 9999, status: 1 }),
    ]);

    const detail = detailRes.data;
    const menus = menuRes.data?.data || menuRes.data || [];
    const dictRows = dictRes.data?.data || [];

    setTitle(detail.table.table_comment || detail.table.table_name || "");
    setColumns(detail.columns || []);
    setMenuTree(filterMenuTree(menus));
    setDictTypeOptions(
      dictRows.map((item: any) => ({
        label: item.name,
        value: item.code,
      })),
    );
    setPreviewFiles([]);
    form.setFieldsValue({ ...detail.table });
  };

  const open = async (data: any) => {
    setCurrentId(Number(data.id));
    setPreviewVisible(false);
    setIsModalOpen(true);
    await loadDetail(Number(data.id));
  };

  const preview = async (data: any) => {
    setCurrentId(Number(data.id));
    setTitle(data.table_comment || data.table_name || "");
    setPreviewFiles([]);
    setIsModalOpen(false);
    setPreviewVisible(false);
    await handlePreviewById(Number(data.id));
  };

  useImperativeHandle(ref, () => ({
    open,
    preview,
  }));

  const handlePreviewById = async (id: number) => {
    setLoading(true);
    try {
      const res = await genCodePreviewApi(id);
      setPreviewFiles(res.data?.files || []);
      setPreviewVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentId) return null;
    setLoading(true);
    try {
      const table = await form.validateFields();
      const payload = {
        table,
        columns,
      };
      const res = await genCodeUpdateApi(currentId, payload);
      setColumns(res.data.columns || []);
      form.setFieldsValue({ ...res.data.table });
      message.success("保存成功");
      onSuccess?.();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!currentId) return;
    const saved = await handleSave();
    if (!saved) return;
    await handlePreviewById(currentId);
  };

  const handleGenerate = async () => {
    if (!currentId) return;
    const saved = await handleSave();
    if (!saved) return;
    setLoading(true);
    try {
      await genCodeGenerateApi(currentId);
      message.success("生成代码并插入菜单成功");
      setPreviewVisible(false);
      setIsModalOpen(false);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo<TabsProps["items"]>(
    () => [
      {
        key: "1",
        label: "配置信息",
        children: <GencodeSetting form={form} menuTree={menuTree} />,
      },
      {
        key: "2",
        label: "字段配置",
        children: (
          <GencodeColumns
            data={columns}
            onChange={setColumns}
            dictTypeOptions={dictTypeOptions}
          />
        ),
      },
    ],
    [columns, dictTypeOptions, form, menuTree],
  );

  const previewItems = useMemo<TabsProps["items"]>(() => {
    if (previewFiles.length === 0) {
      return [
        {
          key: "empty",
          label: "暂无文件",
          children: <Empty description="暂无可预览代码" />,
        },
      ];
    }

    const backendFiles = previewFiles.filter((file) => file.group === "backend");
    const frontendFiles = previewFiles.filter((file) => file.group === "frontend");

    const buildGroupItems = (files: PreviewFileRecord[]) =>
      files.map((file) => ({
        key: file.path,
        label: file.path,
        children: renderPreviewCode(file.content),
      }));

    return [
      {
        key: "backend",
        label: (
          <span>
            <Tag color="blue" style={{ marginInlineEnd: 8 }}>
              后端
            </Tag>
            {backendFiles.length} 个文件
          </span>
        ),
        children:
          backendFiles.length > 0 ? (
            <Tabs items={buildGroupItems(backendFiles)} />
          ) : (
            <Empty description="暂无后端预览代码" />
          ),
      },
      {
        key: "frontend",
        label: (
          <span>
            <Tag color="green" style={{ marginInlineEnd: 8 }}>
              前端
            </Tag>
            {frontendFiles.length} 个文件
          </span>
        ),
        children:
          frontendFiles.length > 0 ? (
            <Tabs items={buildGroupItems(frontendFiles)} />
          ) : (
            <Empty description="暂无前端预览代码" />
          ),
      },
    ];
  }, [previewFiles]);

  return (
    <>
      <Modal
        title={`编辑生成信息 - ${title}`}
        open={isModalOpen}
        width="100%"
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button key="save" loading={loading} onClick={handleSave}>
            保存配置
          </Button>,
          <Button key="preview" loading={loading} onClick={handlePreview}>
            预览代码
          </Button>,
          <Button key="generate" type="primary" loading={loading} onClick={handleGenerate}>
            生成代码并插入菜单
          </Button>,
        ]}
      >
        <Tabs items={items} defaultActiveKey="1" />
      </Modal>
      <Modal
        title="代码预览"
        open={previewVisible}
        width="90%"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Tabs items={previewItems} />
      </Modal>
    </>
  );
});

GencodeModal.displayName = "GencodeModal";

export default GencodeModal;
