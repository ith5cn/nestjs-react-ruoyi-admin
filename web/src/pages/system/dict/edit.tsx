import React from "react";
import { Form, Input, Modal, Radio, message } from "antd";
import { dictTypeCreateApi, dictTypeUpdateApi } from "@/api/system/dict";

export interface EditRef {
    open: (record?: any) => void;
}

const Edit = React.forwardRef<EditRef, { onSuccess: () => void }>((props, ref) => {
    const [open, setOpen] = React.useState(false);
    const [record, setRecord] = React.useState<any>(null);
    const [form] = Form.useForm();

    React.useImperativeHandle(ref, () => ({
        open: (r) => {
            setRecord(r || null);
            setOpen(true);
            if (r) {
                form.setFieldsValue({
                    ...r,
                });
            } else {
                form.resetFields();
            }
        }
    }));

    const onOk = async () => {
        try {
            const values = await form.validateFields();
            let res;
            if (record) {
                res = await dictTypeUpdateApi(record.id, values);
            } else {
                res = await dictTypeCreateApi(values);
            }
            if (res.code === 200 || res.code === 0) {
                message.success(record ? '修改成功' : '新增成功');
                setOpen(false);
                props.onSuccess();
            } else {
                message.error(res.message || (record ? '修改失败' : '新增失败'));
            }
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    return (
        <Modal
            title={record ? "修改字典类型" : "新增字典类型"}
            open={open}
            onOk={onOk}
            onCancel={() => setOpen(false)}
            destroyOnClose
        >
            <Form
                form={form}
                layout="horizontal"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                initialValues={{ status: 1 }}
            >
                <Form.Item
                    name="name"
                    label="字典名称"
                    rules={[{ required: true, message: '请输入字典名称' }]}
                >
                    <Input placeholder="请输入字典名称" />
                </Form.Item>
                <Form.Item
                    name="code"
                    label="字典标示"
                    rules={[{ required: true, message: '请输入字典标示' }]}
                >
                    <Input placeholder="请输入字典标示 (例如: sys_user_sex)" />
                </Form.Item>
                <Form.Item
                    name="status"
                    label="状态"
                >
                    <Radio.Group>
                        <Radio value={1}>正常</Radio>
                        <Radio value={2}>停用</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    name="remark"
                    label="备注"
                >
                    <Input.TextArea placeholder="请输入备注" />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default Edit;
