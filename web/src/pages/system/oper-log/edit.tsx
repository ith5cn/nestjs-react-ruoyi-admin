import { forwardRef, useImperativeHandle, useState } from "react";
import { Col, Form, Input, Modal, Row, message } from "antd";
import { operLogCreateApi, operLogUpdateApi } from "@/api/system/oper-log";

export interface OperLogEditRef {
  open: (type?: "add" | "edit", data?: Record<string, any>) => void;
}

interface OperLogEditProps {
  onSuccess?: () => void;
}

const initialFormData = {
  app: "",
  method: "",
  requestData: "",
  remark: "",
  username: "",
  serviceName: "",
  router: "",
  ip: "",
  ipLocation: "",
};

const OperLogEdit = forwardRef<OperLogEditRef, OperLogEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const title = "操作日志" + (mode === "edit" ? " - 编辑" : " - 新增");

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
        await operLogCreateApi(values);
      } else {
        await operLogUpdateApi(values.id, values);
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
    <Modal open={visible} title={title} confirmLoading={loading} width={"100%"} onOk={handleSubmit} onCancel={close}>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="app" label="应用名称" >
              <Input placeholder="请输入应用名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="method" label="请求方式" >
              <Input placeholder="请输入请求方式" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="requestData" label="请求数据" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
              <Input.TextArea rows={4} placeholder="请输入请求数据" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="remark" label="备注" >
              <Input placeholder="请输入备注" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="username" label="操作用户" >
              <Input placeholder="请输入操作用户" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="serviceName" label="业务名称" >
              <Input placeholder="请输入业务名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="router" label="请求路由" >
              <Input placeholder="请输入请求路由" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ip" label="操作IP" >
              <Input placeholder="请输入操作IP" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ipLocation" label="操作地点" >
              <Input placeholder="请输入操作地点" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

OperLogEdit.displayName = "OperLogEdit";

export default OperLogEdit;
