import { DeleteOutlined, EyeOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Form, Image, Input, List, Modal, Select, Tag, message } from "antd";
import moment from "moment";
import { useMemo, useRef, useState } from "react";
import NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";
import FilePreview from "@/components/file-preview";
import ImagePreview from "@/components/image-preview";
import { attachmentDeleteApi, attachmentListApi } from "@/api/system/attachment";

type AttachmentResourceType = "all" | "image" | "document" | "audio" | "video" | "application";

interface AttachmentRecord {
  id: number;
  originName?: string;
  objectName?: string;
  mimeType?: string;
  sizeInfo?: string;
  sizeByte?: string;
  storageMode?: number;
  url?: string;
  createTime?: string;
  resourceType?: AttachmentResourceType;
}

const storageModeOptions = [
  { label: "本地", value: 1 },
  { label: "OSS", value: 2 },
  { label: "七牛", value: 3 },
  { label: "COS", value: 4 },
  { label: "S3", value: 5 },
];

const resourceTypeOptions: Array<{ key: AttachmentResourceType; label: string }> = [
  { key: "all", label: "所有" },
  { key: "image", label: "图片" },
  { key: "document", label: "文档" },
  { key: "audio", label: "音频" },
  { key: "video", label: "视频" },
  { key: "application", label: "应用程序" },
];

const documentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const getResourceType = (mimeType?: string | null): AttachmentResourceType => {
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  if (!normalizedMimeType) return "application";
  if (normalizedMimeType.startsWith("image/")) return "image";
  if (normalizedMimeType.startsWith("audio/")) return "audio";
  if (normalizedMimeType.startsWith("video/")) return "video";
  if (normalizedMimeType.startsWith("text/")) return "document";
  if (documentMimeTypes.includes(normalizedMimeType)) return "document";
  if (normalizedMimeType.startsWith("application/")) return "application";
  return "application";
};

const resourceTypeLabelMap: Record<AttachmentResourceType, string> = {
  all: "所有",
  image: "图片",
  document: "文档",
  audio: "音频",
  video: "视频",
  application: "应用程序",
};

const resourceTypeColorMap: Record<AttachmentResourceType, string> = {
  all: "default",
  image: "blue",
  document: "gold",
  audio: "purple",
  video: "green",
  application: "cyan",
};

const AttachmentIndex = () => {
  const tableRef = useRef<TableRef>(null);
  const [activeCategory, setActiveCategory] = useState<AttachmentResourceType>("all");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewImageVisible, setPreviewImageVisible] = useState(false);
  const [removeSource, setRemoveSource] = useState(false);

  const categoryItems = useMemo(
    () =>
      resourceTypeOptions.map((item) => ({
        ...item,
        icon: <FolderOpenOutlined />,
      })),
    [],
  );

  const handleDelete = async (ids: Array<number | string>, withSource: boolean) => {
    if (!ids.length) {
      message.warning("请先选择要删除的附件");
      return;
    }
    await attachmentDeleteApi({ ids, removeSource: withSource });
    message.success("删除成功");
    tableRef.current?.clearSelection();
    tableRef.current?.refresh();
  };

  const confirmDelete = (ids: Array<number | string>) => {
    setRemoveSource(false);
    Modal.confirm({
      title: "删除附件",
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>未勾选时仅软删除附件记录；勾选后会尝试同步删除本地 / COS 源文件。</div>
          <Checkbox checked={removeSource} onChange={(event) => setRemoveSource(event.target.checked)}>
            同步删除源文件（本地 / COS）
          </Checkbox>
        </div>
      ),
      onOk: async () => {
        await handleDelete(ids, removeSource);
      },
    });
  };

  const handleView = (record: AttachmentRecord) => {
    const resourceType = record.resourceType || getResourceType(record.mimeType);
    if (!record.url) {
      message.warning("附件地址不存在");
      return;
    }
    if (resourceType === "image") {
      setPreviewImage(record.url);
      setPreviewImageVisible(true);
      return;
    }
    window.open(record.url, "_blank", "noopener,noreferrer");
  };

  const listApi = async (params: any) => {
    const nextParams = { ...params };
    if (Array.isArray(nextParams.dateRange) && nextParams.dateRange.length === 2) {
      nextParams.startDate = moment(nextParams.dateRange[0]).format("YYYY-MM-DD");
      nextParams.endDate = moment(nextParams.dateRange[1]).format("YYYY-MM-DD");
    }
    delete nextParams.dateRange;
    return attachmentListApi(nextParams);
  };

  return (
    <>
      <div className="flex gap-4 h-full">
        <div className="w-[220px] pt-4 border-r border-gray-200">
            <List
              grid={{ gutter: 16, column: 1 }}
              split={false}
              dataSource={categoryItems}
              renderItem={(item) => (
                <List.Item style={{ paddingInline: 0 }}>
                  <Button
                    type={activeCategory === item.key ? "link" : "text"}
                    style={{ width: "100%", justifyContent: "flex-start" }}
                    icon={item.icon}
                    onClick={() => setActiveCategory(item.key)}
                  >
                    {item.label}
                  </Button>
                </List.Item>
              )}
            />
        </div>

        <div>
          <NestTable
            ref={tableRef}
            searchFields={
              <>
                <Col span={6}>
                  <Form.Item label="原文件名" name="originName">
                    <Input placeholder="请输入原文件名" allowClear />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="存储模式" name="storageMode">
                    <Select placeholder="请选择存储模式" options={storageModeOptions} allowClear />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="上传日期" name="dateRange">
                    <DatePicker.RangePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </>
            }
            extraSearchParams={{ resourceType: activeCategory }}
            options={{
              api: listApi,
              operationColumn: true,
              operationColumnWidth: 220,
              operationColumnText: "操作",
            }}
            BeforeHeaderExtend={
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  const selectedKeys = tableRef.current?.getSelectedKeys() || [];
                  if (!selectedKeys.length) {
                    message.warning("请先选择要删除的附件");
                    return;
                  }
                  confirmDelete(selectedKeys as Array<string | number>);
                }}
              >
                批量删除
              </Button>
            }
            operationAfterExtend={(record: AttachmentRecord) => (
              <>
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                  查看
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => confirmDelete([record.id])}
                >
                  删除
                </Button>
              </>
            )}
            columns={[
              {
                title: "预览",
                dataIndex: "url",
                width: 120,
                render: (value: string, record: AttachmentRecord) =>
                  (record.resourceType || getResourceType(record.mimeType)) === "image" ? (
                    <ImagePreview value={value} />
                  ) : (
                    <FilePreview value={value} maxCount={1} />
                  ),
              },
              { title: "原文件名", dataIndex: "originName", width: 220 },
              {
                title: "资源类型",
                dataIndex: "resourceType",
                width: 120,
                render: (value: AttachmentResourceType, record: AttachmentRecord) => {
                  const resourceType = value || getResourceType(record.mimeType);
                  return <Tag color={resourceTypeColorMap[resourceType]}>{resourceTypeLabelMap[resourceType]}</Tag>;
                },
              },
              {
                title: "存储模式",
                dataIndex: "storageMode",
                width: 120,
                render: (value: number) =>
                  storageModeOptions.find((item) => item.value === value)?.label || value || "-",
              },
              { title: "文件大小", dataIndex: "sizeInfo", width: 120 },
              { title: "MIME 类型", dataIndex: "mimeType", width: 240 },
              {
                title: "上传时间",
                dataIndex: "createTime",
                width: 180,
                render: (value: string) => (value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "-"),
              },
            ] as ColumnDef[]}
          />
        </div>
      </div>

      <div style={{ display: "none" }}>
        <Image
          preview={{
            visible: previewImageVisible,
            src: previewImage,
            onVisibleChange: (visible) => setPreviewImageVisible(visible),
          }}
          src={previewImage}
        />
      </div>
    </>
  );
};

export default AttachmentIndex;
