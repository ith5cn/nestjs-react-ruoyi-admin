import { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input, InputNumber, message, Modal, Radio, Row, Col, TreeSelect } from "antd";
import { deptCreateApi, deptListApi, deptUpdateApi } from "@/api/system/dept";

export interface DeptEditRef {
    open: (type?: 'add' | 'edit', data?: Record<string, any>) => void;
    setFormData: (data: Record<string, any>) => void;
}

interface DeptEditProps {
    onSuccess?: () => void;
}

interface DeptFormData {
    id?: number;
    parentId?: number | null;
    name: string;
    sort: number;
    status: number;
    remark?: string;
}

// 表单初始值
const initialFormData: DeptFormData = {
    parentId: null,
    name: '',
    sort: 100,
    status: 1,
    remark: '',
};

const DeptEdit = forwardRef<DeptEditRef, DeptEditProps>(({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [deptTreeData, setDeptTreeData] = useState<any[]>([]);

    const title = '部门管理' + (mode === 'edit' ? ' - 编辑' : ' - 新增');

    // 获取部门树数据
    const fetchDeptTree = async () => {
        try {
            const res = await deptListApi();
            if (res.data?.data) {
                setDeptTreeData(res.data.data);
            } else {
                setDeptTreeData(res.data || []);
            }
        } catch {
            setDeptTreeData([]);
        }
    };

    // 打开弹框
    const open = async (type: 'add' | 'edit' = 'add', data?: Record<string, any>) => {
        setMode(type);
        form.resetFields();
        if (type === 'edit' && data) {
            form.setFieldsValue(data);
        } else {
            form.setFieldsValue({ ...initialFormData });
        }
        setVisible(true);
        await fetchDeptTree();
    };

    // 设置表单数据（编辑时使用）
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
                await deptCreateApi(values);
            } else {
                await deptUpdateApi(values.id, values);
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
            width={600}
            onOk={handleSubmit}
            onCancel={close}
        >
            <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="parentId"
                            label="上级部门"
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 21 }}
                        >
                            <TreeSelect
                                treeData={deptTreeData}
                                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                allowClear
                                placeholder="请选择上级部门"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="部门名称"
                            rules={[{ required: true, message: '请输入部门名称' }]}
                        >
                            <Input placeholder="请输入部门名称" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="sort"
                            label="排序"
                            rules={[{ required: true, message: '请输入排序' }]}
                        >
                            <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="status" label="状态">
                            <Radio.Group
                                options={[
                                    { label: '启用', value: 1 },
                                    { label: '禁用', value: 0 },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="remark"
                            label="备注"
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 21 }}
                        >
                            <Input.TextArea rows={3} placeholder="请输入备注" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
});

DeptEdit.displayName = 'DeptEdit';

export default DeptEdit;
