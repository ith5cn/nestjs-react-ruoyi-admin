import { PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { useEffect, useMemo, useState } from "react";
import request from "@/utils/request";
import { normalizeImageValue } from "@/components/image-preview";

export interface ImageUploadProps {
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  multiple?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  placeholder?: string;
  dirname?: string;
}

type InternalUploadFile = UploadFile<{ path: string; url: string }>;

const defaultAccept = ".jpg,.jpeg,.gif,.png,.webp";

const toPersistedFiles = (value: string | string[] | null | undefined): InternalUploadFile[] =>
  normalizeImageValue(value).map((url, index) => ({
    uid: `persisted-${index}-${url}`,
    name: `image-${index + 1}`,
    status: "done",
    url,
  }));

const ImageUpload = ({
  value,
  onChange,
  multiple = false,
  disabled = false,
  rounded = false,
  maxCount = multiple ? 9 : 1,
  maxSize = 5 * 1024 * 1024,
  accept = defaultAccept,
  placeholder = "上传图片",
  dirname,
}: ImageUploadProps) => {
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
    const nextUrls = normalizeImageValue(value).filter((url) => url !== targetUrl);
    emitValue(nextUrls);
  };

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const file = options.file as RcFile;
    if (file.size > maxSize) {
      message.warning(`${file.name} 超出大小限制`);
      options.onError?.(new Error("file too large"));
      return;
    }

    const currentUrls = normalizeImageValue(value);
    if (multiple && maxCount > 0 && currentUrls.length + uploadingFiles.length >= maxCount) {
      message.warning(`最多上传 ${maxCount} 张图片`);
      options.onError?.(new Error("max count exceeded"));
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const draftFile: InternalUploadFile = {
      uid: String((options.file as RcFile).uid || `${Date.now()}`),
      name: file.name,
      status: "uploading",
      percent: 0,
      thumbUrl: localUrl,
      url: localUrl,
      originFileObj: file as RcFile,
    };

    setUploadingFiles((prev) => [...prev, draftFile]);

    const formData = new FormData();
    formData.append("file", file);
    if (dirname) {
      formData.append("dirname", dirname);
    }

    try {
      const res = await request.uploadFile<{ path: string; url: string }>("/system/uploadImage", formData);
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
      message.error(error?.message || "图片上传失败");
      options.onError?.(error);
    } finally {
      URL.revokeObjectURL(localUrl);
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

  const uploadButtonVisible = !disabled && (multiple ? fileList.length < maxCount : fileList.length === 0);

  return (
    <Upload
      accept={accept}
      listType="picture-card"
      fileList={fileList}
      customRequest={customRequest}
      onRemove={handleRemove}
      multiple={multiple}
      disabled={disabled}
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: !disabled,
      }}
      itemRender={(originNode) => (
        <div style={{ borderRadius: rounded ? "50%" : 8, overflow: "hidden" }}>{originNode}</div>
      )}
    >
      {uploadButtonVisible ? (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>{placeholder}</div>
        </div>
      ) : null}
    </Upload>
  );
};

export default ImageUpload;
