import { forwardRef, useImperativeHandle, useState } from "react";
import { Col, Form, Input, Modal, Row, message } from "antd";
import NestSelect from "@/components/nest-select";
import { loginLogCreateApi, loginLogUpdateApi } from "@/api/system/login-log";

export interface NestSystemLoginLogEditRef {
  open: (type?: "add" | "edit", data?: Record<string, any>) => void;
}

interface NestSystemLoginLogEditProps {
  onSuccess?: () => void;
}

const initialFormData = {
  remark: "",
  username: "",
  status: undefined,
  ip: "",
  ipLocation: "",
  os: "",
  browser: "",
  message: "",
  loginTime: "",
};

const NestSystemLoginLogEdit = forwardRef<NestSystemLoginLogEditRef, NestSystemLoginLogEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const title = "登录日志" + (mode === "edit" ? " - 编辑" : " - 新增");

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
        await loginLogCreateApi(values);
      } else {
        await loginLogUpdateApi(values.id, values);
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
          <Col span={12}>
            <Form.Item name="remark" label="备注" >
              <Input placeholder="请输入备注" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="username" label="登录用户" >
              <Input placeholder="请输入登录用户" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="登录状态" rules={[{ required: true, message: "请输入登录状态" }]}>
              <NestSelect dict="status" placeholder="请选择登录状态" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ip" label="登录IP" >
              <Input placeholder="请输入登录IP" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ipLocation" label="登录地点" >
              <Input placeholder="请输入登录地点" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="os" label="操作系统" >
              <Input placeholder="请输入操作系统" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="browser" label="浏览器" >
              <Input placeholder="请输入浏览器" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="message" label="登录信息" >
              <Input placeholder="请输入登录信息" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="loginTime" label="登录时间" rules={[{ required: true, message: "请输入登录时间" }]}>
              <Input placeholder="请输入登录时间" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

NestSystemLoginLogEdit.displayName = "NestSystemLoginLogEdit";

export default NestSystemLoginLogEdit;
