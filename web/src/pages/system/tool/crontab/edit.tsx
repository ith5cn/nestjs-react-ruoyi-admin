import { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input, message, Modal, Radio, Row, Col } from "antd";
import { crontabCreateApi, crontabUpdateApi } from "@/api/system/crontab";
import NestSelect from "@/components/nest-select";

export interface CrontabEditRef {
    open: (type?: 'add' | 'edit', data?: Record<string, any>) => void;
    setFormData: (data: Record<string, any>) => void;
}

interface CrontabEditProps {
    onSuccess?: () => void;
}

interface CrontabFormData {
    id?: number;
    name: string;
    type: string;
    target: string;
    parameter?: string;
    taskStyle: number;
    rule: string;
    singleton: number;
    status: string;
    remark?: string;
}

// 表单初始值
const initialFormData: CrontabFormData = {
    name: '',
    type: '4',
    target: '',
    parameter: '',
    taskStyle: 1,
    rule: '',
    singleton: 2,
    status: '1',
    remark: '',
};

const CrontabEdit = forwardRef<CrontabEditRef, CrontabEditProps>(({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const title = '任务管理' + (mode === 'edit' ? ' - 编辑' : ' - 新增');

    // 打开弹框
    const open = (type: 'add' | 'edit' = 'add', data?: Record<string, any>) => {
        setMode(type);
        form.resetFields();
        if (type === 'edit' && data) {
            form.setFieldsValue(data);
        } else {
            form.setFieldsValue({ ...initialFormData });
        }
        setVisible(true);
    };

    // 设置表单数据
    const setFormData = (data: Record<string, any>) => {
        form.setFieldsValue(data);
    };

    // 关闭弹框
    const close = () => {
        setVisible(false);
    };

    // 提交表单
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            if (mode === 'add') {
                await crontabCreateApi(values);
            } else {
                await crontabUpdateApi(values.id, values);
            }
            message.success('操作成功');
            onSuccess?.();
            close();
        } catch (error: any) {
            if (error?.errorFields) return;
        } finally {
            setLoading(false);
        }
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        open,
        setFormData,
    }));

    return (
        <Modal
            open={visible}
            title={title}
            confirmLoading={loading}
            width={700}
            onOk={handleSubmit}
            onCancel={close}
            destroyOnClose
        >
            <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="任务名称"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: '请输入任务名称' }]}
                        >
                            <Input placeholder="请输入任务名称" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="type"
                            label="任务类型"
                            
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: '请选择任务类型' }]}
                        >
                             <NestSelect dict="crontab_type" placeholder="请选择类型" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="rule"
                            label="执行表达式"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: '请输入 Cron 表达式' }]}
                        >
                            <Input placeholder="例如: 0 0 1 * * *" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="target"
                            label="调用目标"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: '请输入调用目标' }]}
                        >
                            <Input placeholder="请输入调用目标字符串" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="taskStyle"
                            label="执行类型"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: '请选择执行类型' }]}
                        >
                            <Radio.Group>
                                <Radio value={1}>系统内部任务</Radio>
                                <Radio value={2}>HTTP 请求任务</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="parameter"
                            label="目标参数"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                        >
                            <Input.TextArea placeholder="请输入调用任务参数 (JSON格式)" rows={2} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="status" label="状态" labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}>
                            <NestSelect dict="status" placeholder="请选择状态" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="remark"
                            label="备注"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                        >
                            <Input.TextArea rows={2} placeholder="请输入备注" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
});

CrontabEdit.displayName = 'CrontabEdit';

export default CrontabEdit;