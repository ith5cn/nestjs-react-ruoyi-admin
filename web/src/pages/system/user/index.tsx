import { useRef, useState } from "react";
import type { Key } from "react";
import NestAccessDept from "@/components/nest-access-dept";
import NestTable, { type ColumnDef } from "@/components/nest-table";
import { userDeleteApi, userListApi, userUpdateApi, userRefreshCacheApi } from "@/api/system/user";
import { Button, Col, Dropdown, Form, Input, Space, Switch, message } from "antd";
import moment from "moment";
import Edit, { type EditRef } from "./edit";
import type { TableRef } from "@/components/nest-table";
import { EllipsisOutlined, ReloadOutlined } from "@ant-design/icons";
import { type NestDictModalRef } from "@/components/nest-dict-modal";

const StatusSwitch = ({ record }: { record: any }) => {
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(record.status == 1);

    // 更新状态
    const onChange = async (newChecked: boolean) => {
        setLoading(true);
        try {
            const res = await userUpdateApi(record.id, { status: newChecked ? 1 : 2 });
            if (res.code === 200 || res.code === 0) {
                message.success('状态更新成功');
                setChecked(newChecked);
            } else {
                message.error(res.message || '更新失败');
            }
        } catch (error) {
            message.error('更新失败');
        } finally {
            setLoading(false);
        }
    };

    return <Switch checked={checked} checkedChildren="正常" unCheckedChildren="禁用" loading={loading} onChange={onChange} />;
};

const UserIndex = () => {
    const [selectedDeptId, setSelectedDeptId] = useState<Key | undefined>();
    const editRef = useRef<EditRef>(null);
    const tableRef = useRef<TableRef>(null);
    const setHomeRef = useRef<NestDictModalRef>(null);

    const handleDeptSelect = (deptId: Key | undefined) => {
        setSelectedDeptId(deptId);
        console.log("Selected Department ID:", deptId);
    };


    const updateCache = async (id: number) => {
        try {
            const res = await userRefreshCacheApi(id);
            if (res.code === 200 || res.code === 0) {
                message.success('缓存刷新成功');
            } else {
                message.error(res.message || '缓存刷新失败');
            }
        } catch (error) {
            message.error('缓存刷新失败');
        }
    }

    return (
        <div className="flex h-full gap-4">
            {/* 左侧部门树 */}
            <NestAccessDept onSelect={handleDeptSelect} />

            {/* 右侧内容区 (预留) */}
            <div className="flex-1 bg-white p-4 overflow-auto">
                <NestTable
                    ref={tableRef}
                    searchFields={
                        <>
                            <Col span={6}>
                                <Form.Item label="账号" name="username">
                                    <Input placeholder="请输入" allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="昵称" name="nickname">
                                    <Input placeholder="请输入" allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="手机" name="phone">
                                    <Input placeholder="请输入" allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="邮箱" name="email">
                                    <Input placeholder="请输入" allowClear />
                                </Form.Item>
                            </Col>
                        </>
                    }
                    extraSearchParams={{
                        deptId: selectedDeptId
                    }}
                    options={{
                        api: userListApi,
                        pageSize: 10,
                        add: {
                            func: () => editRef.current?.open('add'),
                            auth: ['/system/user/create'],
                            show: true
                        },
                        edit: {
                            func: (record: any) => editRef.current?.open('edit', record),
                            auth: ['/system/user/update'],
                            show: true
                        },
                        delete: {
                            func: async (record: any) => {
                                const res = await userDeleteApi(record.id)
                                if (res.code === 0) {
                                    message.success("删除成功")
                                    tableRef.current?.refresh();
                                }
                            },
                            auth: ['/system/user/destroy'],
                            show: true
                        },
                        operationColumnWidth: 220
                    }}
                    columns={[
                        { title: '账号', dataIndex: 'username' },
                        { title: '昵称', dataIndex: 'nickname' },
                        { title: '手机', dataIndex: 'phone' },
                        { title: '邮箱', dataIndex: 'email' },
                        { title: '状态', dataIndex: 'status', render: (_: any, record: any) => <StatusSwitch record={record} /> },
                        { title: '创建时间', dataIndex: 'createTime', render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                    ] as ColumnDef[]}
                    operationCell={(record) => {
                        // 只有 id 为 1 时展示更新缓存，其余可能返回默认或空
                        if (record.id === 1) {
                            return (
                                <Button type="link" onClick={() => updateCache(record.id)}>
                                    <ReloadOutlined /> 更新缓存
                                </Button>
                            );
                        }

                    }}
                    operationAfterExtend={(record) => {
                        const items = [
                            {
                                key: 'refresh-cache',
                                label: '刷新缓存',
                            },
                            {
                                key: 'reset-password',
                                label: '重置密码',
                            },
                            {
                                key: 'apply-tcl-account',
                                label: '申请 tcl 账号',
                            },
                            {
                                key: 'set-home',
                                label: '设置首页',
                            }
                        ];

                        const handleMenuClick = async ({ key }: { key: string }) => {
                            if (key === 'refresh-cache') {
                                updateCache(record.id)
                            } else if (key === 'reset-password') {
                                // TODO: 发出重置密码弹窗或请求
                                message.info('正在开发中');
                            } else if (key === 'set-home') {
                                setHomeRef.current?.open('设置首页', record);
                            }
                        };

                        return <>
                            {
                                record.id === 1 ? <></> : <>
                                    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['hover']}>
                                        <a onClick={(e) => e.preventDefault()}>
                                            <Space>
                                                <EllipsisOutlined />
                                                更多
                                            </Space>
                                        </a>
                                    </Dropdown></>
                            }
                        </>
                    }}
                />
                {/* {selectedDeptId ? (
                    <div>当前选中部门ID: {selectedDeptId}</div>
                ) : (
                    <div>请选择部门</div>
                )} */}
            </div >
            <Edit ref={editRef} onSuccess={() => {
                tableRef.current?.refresh()
            }} />
        </div>
    );
};

export default UserIndex;