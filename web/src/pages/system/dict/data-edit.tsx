import React from "react";
import { Form, Input, InputNumber, Modal, Radio, message, ColorPicker } from "antd";
import { dictDataCreateApi, dictDataUpdateApi } from "@/api/system/dict";

export interface DataEditRef {
    open: (typeId: number, record?: any) => void;
}

const DataEdit = React.forwardRef<DataEditRef, { onSuccess: () => void }>((props, ref) => {
    const [open, setOpen] = React.useState(false);
    const [record, setRecord] = React.useState<any>(null);
    const [typeId, setTypeId] = React.useState<number>(0);
    const [form] = Form.useForm();

    React.useImperativeHandle(ref, () => ({
        open: (tid, r) => {
            setTypeId(tid);
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
                res = await dictDataUpdateApi(record.id, { ...record, ...values });
            } else {
                res = await dictDataCreateApi({ ...values, typeId });
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
            title={record ? "修改系统字典数据" : "新增系统字典数据"}
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
                initialValues={{ status: 1, sort: 0 }}
            >
                <Form.Item
                    name="label"
                    label="数据标签"
                    rules={[{ required: true, message: '请输入数据标签' }]}
                >
                    <Input placeholder="请输入数据标签" />
                </Form.Item>
                <Form.Item
                    name="value"
                    label="数据键值"
                    rules={[{ required: true, message: '请输入数据键值' }]}
                >
                    <Input placeholder="请输入数据键值" />
                </Form.Item>
                <Form.Item
                    name="color"
                    label="数据颜色"
                    getValueFromEvent={(color) => typeof color === 'string' ? color : color?.toHexString?.() || ''}
                >
                    <ColorPicker allowClear showText format="hex" />
                </Form.Item>
                <Form.Item
                    name="sort"
                    label="排序"
                >
                    <InputNumber min={0} placeholder="数字越大越靠前" style={{ width: '100%' }} />
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
                    <Input.TextArea placeholder="请输入内容" />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default DataEdit;
