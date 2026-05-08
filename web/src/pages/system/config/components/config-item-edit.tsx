import { forwardRef, useImperativeHandle, useState } from "react";
import { Col, Form, Input, InputNumber, Modal, Row, Select, message } from "antd";
import { configCreateApi, configUpdateApi, getConfigGroupListApi } from "@/api/system/config";
import { inputComponentOptions } from "./config-constants";

export interface ConfigItemEditRef {
  open: (type?: "add" | "edit", data?: Record<string, any>) => void;
}

interface ConfigItemEditProps {
  onSuccess?: () => void;
}

const initialFormData = {
  id: undefined,
  group_id: undefined,
  name: "",
  key: "",
  value: "",
  input_type: "input",
  config_select_data: "",
  sort: 100,
  remark: "",
};

const normalizeSelectDataInput = (value: any) => {
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }
  return value || "";
};

const ConfigItemEdit = forwardRef<ConfigItemEditRef, ConfigItemEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [form] = Form.useForm();
  const title = `参数配置${mode === "edit" ? " - 编辑" : " - 新增"}`;

  const loadGroups = async () => {
    const res = await getConfigGroupListApi({});
    const rows = res.data || [];
    setGroupOptions(rows.map((item: any) => ({ label: `${item.name} (${item.code})`, value: item.id })));
  };

  const open = async (type: "add" | "edit" = "add", data?: Record<string, any>) => {
    setMode(type);
    await loadGroups();
    form.resetFields();
    form.setFieldsValue(
      type === "edit" && data
        ? { ...data, config_select_data: normalizeSelectDataInput(data.config_select_data) }
        : { ...initialFormData, ...(data || {}) },
    );
    setVisible(true);
  };

  const close = () => setVisible(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        config_select_data:
          ["select", "radio"].includes(values.input_type) && values.config_select_data
            ? String(values.config_select_data).trim()
            : "",
      };
      if (mode === "add") {
        await configCreateApi(payload);
      } else {
        await configUpdateApi(values.id, payload);
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

  const currentInputType = Form.useWatch("input_type", form);

  return (
    <Modal open={visible} title={title} width={800} confirmLoading={loading} onOk={handleSubmit} onCancel={close}>
      <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="group_id" label="配置分组" rules={[{ required: true, message: "请选择配置分组" }]}>
              <Select options={groupOptions} placeholder="请选择配置分组" disabled />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="name" label="配置标题" rules={[{ required: true, message: "请输入配置标题" }]}>
              <Input placeholder="请输入配置标题" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="key" label="配置标识" rules={[{ required: true, message: "请输入配置标识" }]}>
              <Input placeholder="请输入配置标识" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="value" label="配置值">
              <Input.TextArea rows={2} placeholder="请输入配置值" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="sort" label="排序">
              <InputNumber min={0} max={999} style={{ width: "100%" }} placeholder="请输入排序" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="input_type"
              label="输入组件"
              rules={[{ required: true, message: "请选择输入组件" }]}
            >
              <Select options={inputComponentOptions} placeholder="请选择输入组件" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="配置说明">
              <Input.TextArea rows={2} placeholder="请输入配置说明" />
            </Form.Item>
          </Col>
          {["select", "radio"].includes(currentInputType) ? (
            <Col span={24}>
              <Form.Item
                name="config_select_data"
                label="配置数据"
                extra='用于配置下拉、单选的数据，格式示例：[{"label":"数据一","value":"value1"}]'
              >
                <Input.TextArea rows={8} placeholder='请输入 JSON 数组，例如 [{"label":"启用","value":1}]' />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
});

ConfigItemEdit.displayName = "ConfigItemEdit";

export default ConfigItemEdit;
