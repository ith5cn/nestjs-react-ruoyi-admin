import { FileTextOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Space, Tag, Tooltip } from "antd";

interface FilePreviewProps {
  value?: string | string[] | null;
  maxCount?: number;
}

const isJsonArrayString = (value: string) => {
  const text = value.trim();
  return text.startsWith("[") && text.endsWith("]");
};

const normalizeFileValue = (value?: string | string[] | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];
  if (isJsonArrayString(value)) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return value ? [value] : [];
};

const getFileName = (url: string) => {
  const text = String(url || "");
  const clean = text.split("?")[0];
  return clean.slice(clean.lastIndexOf("/") + 1) || text;
};

const FilePreview = ({ value, maxCount = 3 }: FilePreviewProps) => {
  const files = normalizeFileValue(value);
  if (files.length === 0) return <>-</>;

  const visibleFiles = files.slice(0, maxCount);
  const hiddenCount = files.length - visibleFiles.length;

  return (
    <Space size={6} wrap>
      {visibleFiles.map((url, index) => {
        const fileName = getFileName(url);
        return (
          <Tooltip key={`${url}-${index}`} title={fileName}>
            <Tag icon={<FileTextOutlined />} style={{ maxWidth: 220 }}>
              <a href={url} target="_blank" rel="noreferrer">
                {fileName}
              </a>
            </Tag>
          </Tooltip>
        );
      })}
      {hiddenCount > 0 ? <Tag icon={<PaperClipOutlined />}>{`+${hiddenCount}`}</Tag> : null}
    </Space>
  );
};

export default FilePreview;
export { normalizeFileValue, getFileName };
