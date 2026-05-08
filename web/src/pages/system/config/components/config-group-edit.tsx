import { forwardRef, useImperativeHandle, useState } from "react";
import { Col, Form, Input, Modal, Row, message } from "antd";
import { configGroupCreateApi, configGroupUpdateApi } from "@/api/system/config";

export interface ConfigGroupEditRef {
  open: (type?: "add" | "edit", data?: Record<string, any>) => void;
}

interface ConfigGroupEditProps {
  onSuccess?: () => void;
}

const initialFormData = {
  id: undefined,
  name: "",
  code: "",
  remark: "",
};

const ConfigGroupEdit = forwardRef<ConfigGroupEditRef, ConfigGroupEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const title = `配置分组${mode === "edit" ? " - 编辑" : " - 新增"}`;

  const open = (type: "add" | "edit" = "add", data?: Record<string, any>) => {
    setMode(type);
    form.resetFields();
    form.setFieldsValue(type === "edit" && data ? { ...data } : { ...initialFormData });
    setVisible(true);
  };

  const close = () => setVisible(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      if (mode === "add") {
        await configGroupCreateApi(values);
      } else {
        await configGroupUpdateApi(values.id, values);
      }
      message.success("操作成功");
      onSuccess?.();
      close();
    } catch (error: any) {
      if (error?.errorFields) return;
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ open }));

  return (
    <Modal open={visible} title={title} confirmLoading={loading} width={600} onOk={handleSubmit} onCancel={close}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="name" label="组名称（中文）" rules={[{ required: true, message: "请输入组名称" }]}>
              <Input placeholder="请输入组名称（中文）" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="code" label="组标识（英文）" rules={[{ required: true, message: "请输入组标识" }]}>
              <Input placeholder="请输入组标识（英文）" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

ConfigGroupEdit.displayName = "ConfigGroupEdit";

export default ConfigGroupEdit;
