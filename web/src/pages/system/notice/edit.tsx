import { forwardRef, useImperativeHandle, useState } from "react";
import { Col, Form, Input, InputNumber, Modal, Row, message } from "antd";
import NestSelect from "@/components/nest-select";
import { noticeCreateApi, noticeUpdateApi } from "@/api/system/notice";

export interface NoticeEditRef {
  open: (type?: "add" | "edit", data?: Record<string, any>) => void;
}

interface NoticeEditProps {
  onSuccess?: () => void;
}

const initialFormData = {
  messageId: undefined,
  title: "",
  type: undefined,
  content: "",
  clickNum: undefined,
  remark: "",
};

const NoticeEdit = forwardRef<NoticeEditRef, NoticeEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const title = "系统公告" + (mode === "edit" ? " - 编辑" : " - 新增");

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
        await noticeCreateApi(values);
      } else {
        await noticeUpdateApi(values.id, values);
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
            <Form.Item name="messageId" label="消息ID" >
              <InputNumber style={{ width: "100%" }} placeholder="请输入消息ID" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="title" label="标题" >
              <Input placeholder="请输入标题" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="公告类型" >
              <NestSelect dict="notice_type" placeholder="请选择公告类型" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="content" label="公告内容" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} >
              <Input.TextArea rows={4} placeholder="请输入公告内容" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="clickNum" label="浏览次数" >
              <InputNumber style={{ width: "100%" }} placeholder="请输入浏览次数" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="remark" label="备注" >
              <Input placeholder="请输入备注" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

NoticeEdit.displayName = "NoticeEdit";

export default NoticeEdit;
