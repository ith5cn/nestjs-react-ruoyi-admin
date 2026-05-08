import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import type { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";
import request from "@/utils/request";
import "@wangeditor/editor/dist/css/style.css";

interface WangEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number;
}

const buildStaticUrl = (path?: string, url?: string) => {
  if (url) return url;
  const base = String(import.meta.env.VITE_STATIC_PATH || import.meta.env.VITE_STATIC_COS_PATH || "")
    .trim()
    .replace(/\/+$/, "");
  const cleanPath = String(path || "").trim().replace(/^\/+/, "");
  if (!cleanPath) return "";
  return base ? `${base}/${cleanPath}` : cleanPath;
};

const WangEditor = ({
  value = "",
  onChange,
  placeholder = "请输入内容",
  disabled = false,
  height = 320,
}: WangEditorProps) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState(value);

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(
    () => ({
      excludeKeys: [],
    }),
    [],
  );

  const editorConfig = useMemo<Partial<IEditorConfig>>(
    () => ({
      placeholder,
      readOnly: disabled,
      MENU_CONF: {
        uploadImage: {
          async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
            const formData = new FormData();
            formData.append("file", file);
            try {
              const res = await request.uploadFile<{ path: string; url: string }>(
                "/system/uploadImage",
                formData,
              );
              const imageUrl = buildStaticUrl(res.data?.path, res.data?.url);
              if (!imageUrl) {
                throw new Error("图片地址为空");
              }
              insertFn(imageUrl, file.name, imageUrl);
            } catch (error: any) {
              message.error(error?.message || "图片上传失败");
            }
          },
        },
      },
    }),
    [disabled, placeholder],
  );

  return (
    <div style={{ border: "1px solid #d9d9d9", borderRadius: 8, overflow: "hidden" }}>
      <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        mode="default"
        onCreated={setEditor}
        onChange={(nextEditor) => {
          const nextHtml = nextEditor.getHtml();
          setHtml(nextHtml);
          onChange?.(nextHtml);
        }}
        style={{ height, overflowY: "hidden" }}
      />
    </div>
  );
};

export default WangEditor;
