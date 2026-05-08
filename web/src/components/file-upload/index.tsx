import { DeleteOutlined, InboxOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, message, Space, Tooltip, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { useEffect, useMemo, useState } from "react";
import request from "@/utils/request";
import { getFileName, normalizeFileValue } from "@/components/file-preview";

export interface FileUploadProps {
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  multiple?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  showList?: boolean;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  placeholder?: string;
  dirname?: string;
}

type InternalUploadFile = UploadFile<{ path: string; url: string; name: string }>;

const toPersistedFiles = (value: string | string[] | null | undefined): InternalUploadFile[] =>
  normalizeFileValue(value).map((url, index) => ({
    uid: `persisted-file-${index}-${url}`,
    name: getFileName(url),
    status: "done",
    url,
  }));

const FileUpload = ({
  value,
  onChange,
  multiple = false,
  disabled = false,
  draggable = false,
  showList = true,
  maxCount = multiple ? 9 : 1,
  maxSize = 20 * 1024 * 1024,
  accept = "*",
  placeholder = "上传文件",
  dirname,
}: FileUploadProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<InternalUploadFile[]>([]);

  useEffect(() => {
    setUploadingFiles((prev) => prev.filter((item) => item.status === "uploading"));
  }, [value]);

  const persistedFiles = useMemo(() => toPersistedFiles(value), [value]);
  const fileList = useMemo(
    () => [...persistedFiles, ...uploadingFiles.filter((item) => item.status === "uploading")],
    [persistedFiles, uploadingFiles],
  );

  const emitValue = (urls: string[]) => {
    if (multiple) {
      onChange?.(urls);
    } else {
      onChange?.(urls[0] || null);
    }
  };

  const removePersistedFile = (targetUrl?: string) => {
    const nextUrls = normalizeFileValue(value).filter((url) => url !== targetUrl);
    emitValue(nextUrls);
  };

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const file = options.file as RcFile;
    if (file.size > maxSize) {
      message.warning(`${file.name} 超出文件大小限制`);
      options.onError?.(new Error("file too large"));
      return;
    }

    const currentUrls = normalizeFileValue(value);
    if (multiple && maxCount > 0 && currentUrls.length + uploadingFiles.length >= maxCount) {
      message.warning(`最多上传 ${maxCount} 个文件`);
      options.onError?.(new Error("max count exceeded"));
      return;
    }

    const draftFile: InternalUploadFile = {
      uid: String((options.file as RcFile).uid || `${Date.now()}`),
      name: file.name,
      status: "uploading",
      percent: 0,
      originFileObj: file as RcFile,
    };
    setUploadingFiles((prev) => [...prev, draftFile]);

    const formData = new FormData();
    formData.append("file", file);
    if (dirname) {
      formData.append("dirname", dirname);
    }

    try {
      const res = await request.uploadFile<{ path: string; url: string; name: string }>(
        "/system/uploadFile",
        formData,
      );
      const uploadedUrl = res.data?.url || res.data?.path;
      if (!uploadedUrl) {
        throw new Error("上传返回为空");
      }

      setUploadingFiles((prev) => prev.filter((item) => item.uid !== draftFile.uid));
      const nextUrls = multiple ? [...currentUrls, uploadedUrl] : [uploadedUrl];
      emitValue(nextUrls);
      options.onSuccess?.(res.data, options.file);
    } catch (error: any) {
      setUploadingFiles((prev) => prev.filter((item) => item.uid !== draftFile.uid));
      message.error(error?.message || "文件上传失败");
      options.onError?.(error);
    }
  };

  const handleRemove = async (file: UploadFile) => {
    if (file.status === "uploading") {
      setUploadingFiles((prev) => prev.filter((item) => item.uid !== file.uid));
      return true;
    }
    removePersistedFile(file.url);
    return true;
  };

  const renderList = () => {
    if (!showList) return null;
    return (
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
        {fileList
          .filter((item) => item.url || item.status === "uploading")
          .map((file) => (
            <div
              key={file.uid}
              style={{
                background: "rgba(22, 93, 255, 0.08)",
                borderRadius: 6,
                minHeight: 36,
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Tooltip title="点击文件名预览/下载">
                {file.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer" style={{ color: "#165dff", flex: 1 }}>
                    <Space size={6}>
                      <PaperClipOutlined />
                      <span>{file.name || getFileName(file.url)}</span>
                    </Space>
                  </a>
                ) : (
                  <Space size={6} style={{ flex: 1 }}>
                    <UploadOutlined />
                    <span>{file.name}</span>
                  </Space>
                )}
              </Tooltip>
              {!disabled ? (
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => void handleRemove(file)} />
              ) : null}
            </div>
          ))}
      </div>
    );
  };

  const uploadNode = draggable ? (
    <Upload.Dragger
      customRequest={customRequest}
      showUploadList={false}
      multiple={multiple}
      accept={accept}
      disabled={disabled}
    >
      <div style={{ padding: 24 }}>
        <InboxOutlined style={{ fontSize: 48, color: "#9ca3af" }} />
        <div style={{ marginTop: 8, color: "#dc2626", fontWeight: 700 }}>{placeholder}</div>
        <div style={{ marginTop: 8 }}>
          将文件拖到此处，或<span style={{ color: "#3370ff" }}>点击上传</span>
        </div>
      </div>
    </Upload.Dragger>
  ) : (
    <Upload
      customRequest={customRequest}
      showUploadList={false}
      multiple={multiple}
      accept={accept}
      disabled={disabled || (!multiple && persistedFiles.length > 0)}
    >
      <Button icon={<UploadOutlined />} disabled={disabled || (!multiple && persistedFiles.length > 0)}>
        {placeholder}
      </Button>
    </Upload>
  );

  return (
    <div>
      {uploadNode}
      {renderList()}
    </div>
  );
};

export default FileUpload;
