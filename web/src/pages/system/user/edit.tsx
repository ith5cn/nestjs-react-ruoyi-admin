import { userAddApi, userUpdateApi } from "@/api/system/user";
import DeptSelect from "@/components/dept-select";
import PostSelect from "@/components/post-select";
import RoleSelect from "@/components/role-select";
import { Form, Input, message, Modal, Radio, Row, Col } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";


export interface EditRef {
    open: (type?: 'add' | 'edit', data?: Record<string, any>) => void;
    setFormData: (data: Record<string, any>) => void;
}

interface EditProps {
    onSuccess?: () => void;
}

interface UserFormData {
    id: number;
    username: string;
    nickname?: string;
    password?: string;
    phone?: string;
    email?: string;
    roles: number[];
    postId?: number[];
    deptId: string;
    status?: number;
    remark?: string;
}

const Edit = forwardRef<EditRef, EditProps>(({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // 表单初始值
    const initialFormData: UserFormData = {
        id: 0,
        username: '',
        nickname: '',
        password: '',
        phone: '',
        email: '',
        roles: [],
        postId: [],
        deptId: '',
        status: 1,
        remark: '',
    };

    // 设置title
    const title = '用户管理' + (mode === 'edit' ? ' - 编辑' : ' - 新增');


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
            console.log('Received values of form:', values);
            if (mode === 'add') {
                await userAddApi(values);
            } else {
                await userUpdateApi(values.id, values);
            }
            message.success('操作成功');
            onSuccess?.();
            close();
        } catch (error: any) {
            // 如果是校验错误则忽略，API 错误由 request 拦截器处理
            if (error?.errorFields) return;
        } finally {
            setLoading(false);
        }
    };

    // 暴露给父组件的方法（等同于 Vue 的 defineExpose）
    useImperativeHandle(ref, () => ({
        open,
        setFormData,
    }));
    return <Modal open={visible} title={title} loading={loading} width={700} onOk={() => {
        handleSubmit();
    }} onCancel={() => {
        setVisible(false);
    }}>
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="id" hidden>
                <Input />
            </Form.Item>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
                        <Input placeholder="请输入账号" />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="deptId" label="所属部门" rules={[{ required: true, message: '请选择所属部门' }]}>
                        <DeptSelect value={form.getFieldValue('deptId')} onChange={(deptId) => form.setFieldsValue({ deptId })} />
                    </Form.Item>
                </Col>
                {
                    mode === 'add' && <Col span={12}>
                        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                            <Input placeholder="请输入密码" />
                        </Form.Item>
                    </Col>
                }
                <Col span={12}>
                    <Form.Item name="nickname" label="昵称">
                        <Input placeholder="请输入昵称" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="roles" label="角色">
                        <RoleSelect onChange={(value: number[]) => form.setFieldsValue({ roles: value })} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="postId" label="岗位">
                        <PostSelect onChange={(value: number[]) => form.setFieldsValue({ postId: value })} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="phone" label="手机号">
                        <Input placeholder="请输入手机号" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="email" label="邮箱">
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>
                </Col>


                <Col span={12}>
                    <Form.Item name="status" label="状态">
                        <Radio.Group options={[
                            { label: '启用', value: 1 },
                            { label: '禁用', value: 0 },
                        ]} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="remark" label="备注" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                        <Input.TextArea rows={3} placeholder="请输入备注" />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    </Modal >
});

export default Edit;
