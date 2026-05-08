import { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input, InputNumber, message, Modal, Radio, Row, Col, TreeSelect, Select } from "antd";
import { roleCreateApi, roleListApi, roleUpdateApi } from "@/api/system/role";

export interface RoleEditRef {
    open: (type?: 'add' | 'edit', data?: Record<string, any>) => void;
    setFormData: (data: Record<string, any>) => void;
}

interface RoleEditProps {
    onSuccess?: () => void;
}

interface RoleFormData {
    id?: number;
    parent_id?: number | null;
    name: string;
    code: string;
    dataScope: number;
    sort: number;
    status: number;
    remark?: string;
}

// 表单初始值
const initialFormData: RoleFormData = {
    parent_id: null,
    name: '',
    code: '',
    dataScope: 1,
    sort: 100,
    status: 1,
    remark: '',
};

const dataScopeOptions = [
    { label: '全部数据权限', value: 1 },
    { label: '自定义数据权限', value: 2 },
    { label: '本部门数据权限', value: 3 },
    { label: '本部门及以下数据权限', value: 4 },
    { label: '本人数据权限', value: 5 },
];

const RoleEdit = forwardRef<RoleEditRef, RoleEditProps>(({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roleTreeData, setRoleTreeData] = useState<any[]>([]);

    const title = '角色管理' + (mode === 'edit' ? ' - 编辑' : ' - 新增');

    // 获取角色树数据
    const fetchRoleTree = async () => {
        try {
            const res = await roleListApi();
            if (res.data?.data) {
                setRoleTreeData(res.data.data);
            } else {
                setRoleTreeData(res.data || []);
            }
        } catch {
            setRoleTreeData([]);
        }
    };

    // 打开弹框
    const open = async (type: 'add' | 'edit' = 'add', data?: Record<string, any>) => {
        setMode(type);
        form.resetFields();
        if (type === 'edit' && data) {
            form.setFieldsValue({
                ...data,
                parent_id: data.parentId || null,
            });
        } else {
            form.setFieldsValue({ ...initialFormData });
        }
        setVisible(true);
        await fetchRoleTree();
    };

    // 设置表单数据（新增子角色时使用）
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
                await roleCreateApi(values);
            } else {
                await roleUpdateApi(values.id, values);
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
                            name="parent_id"
                            label="上级角色"
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 21 }}
                        >
                            <TreeSelect
                                treeData={roleTreeData}
                                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                allowClear
                                placeholder="请选择上级角色"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="角色名称"
                            rules={[{ required: true, message: '请输入角色名称' }]}
                        >
                            <Input placeholder="请输入角色名称" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="code"
                            label="角色编码"
                            rules={[{ required: true, message: '请输入角色编码' }]}
                        >
                            <Input placeholder="请输入角色编码" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="dataScope"
                            label="数据范围"
                        >
                            <Select
                                options={dataScopeOptions}
                                placeholder="请选择数据范围"
                            />
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

RoleEdit.displayName = 'RoleEdit';

export default RoleEdit;
