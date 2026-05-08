import { Image, Space } from "antd";

interface ImagePreviewProps {
  value?: string | string[] | null;
  size?: number;
  rounded?: boolean;
  maxPreviewCount?: number;
}

const isJsonArrayString = (value: string) => {
  const text = value.trim();
  return text.startsWith("[") && text.endsWith("]");
};

const normalizeImageValue = (value?: string | string[] | null): string[] => {
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

const ImagePreview = ({
  value,
  size = 48,
  rounded = false,
  maxPreviewCount = 3,
}: ImagePreviewProps) => {
  const images = normalizeImageValue(value);
  if (images.length === 0) return <>-</>;

  const visibleImages = images.slice(0, maxPreviewCount);
  const hiddenCount = images.length - visibleImages.length;
  const radius = rounded ? "50%" : 8;

  return (
    <Space size={8} wrap>
      <Image.PreviewGroup items={images}>
        {visibleImages.map((url, index) => (
          <Image
            key={`${url}-${index}`}
            src={url}
            width={size}
            height={size}
            style={{ objectFit: "cover", borderRadius: radius }}
          />
        ))}
      </Image.PreviewGroup>
      {hiddenCount > 0 ? <span>{`+${hiddenCount}`}</span> : null}
    </Space>
  );
};

export default ImagePreview;
export { normalizeImageValue };
