import { useRef } from "react";
import { Col, Form, Input } from "antd";
import NestTable, { type TableRef, type ColumnDef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { roleDeleteApi, roleListApi } from "@/api/system/role";
import { message } from "antd";
import moment from "moment";
import RoleEdit, { type RoleEditRef } from "./edit";
import MenuPermission, { type MenuPermissionRef } from "./menu-permission";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button } from "antd";

const dataScopeMap: Record<number, string> = {
    1: '全部数据',
    2: '自定义数据',
    3: '本部门数据',
    4: '本部门及以下',
    5: '本人数据',
};

const RoleIndex = () => {
    const editRef = useRef<RoleEditRef>(null);
    const tableRef = useRef<TableRef>(null);
    const menuPermissionRef = useRef<MenuPermissionRef>(null);

    return (
        <>
            <NestTable
                ref={tableRef}
                searchFields={
                    <>
                        <Col span={6}>
                            <Form.Item name="name" label="角色名称">
                                <Input placeholder="请输入角色名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="code" label="角色编码">
                                <Input placeholder="请输入角色编码" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="status" label="状态">
                                <NestSelect dict="status" placeholder="请选择状态" />
                            </Form.Item>
                        </Col>
                    </>
                }
                options={{
                    api: roleListApi,
                    add: {
                        show: true,
                        auth: ['/system/role/create'],
                        func: () => editRef.current?.open('add'),
                    },
                    edit: {
                        show: true,
                        auth: ['/system/role/update'],
                        func: (record: any) => editRef.current?.open('edit', record),
                    },
                    delete: {
                        show: true,
                        auth: ['/system/role/destroy'],
                        func: async (record: any) => {
                            const res = await roleDeleteApi(record.id);
                            if (res.code === 0) {
                                message.success("删除成功");
                                tableRef.current?.refresh();
                            }
                        },
                    },
                }}
                operationBeforeExtend={(record) => (
                    <>
                        <Button
                            type="link"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                editRef.current?.open('add');
                                editRef.current?.setFormData({ parent_id: record.id });
                            }}
                        >
                            新增
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            icon={<SafetyCertificateOutlined />}
                            onClick={() => menuPermissionRef.current?.open(record)}
                        >
                            菜单权限
                        </Button>
                    </>
                )}
                columns={[
                    { title: '角色名称', dataIndex: 'name', width: 200 },
                    { title: '角色编码', dataIndex: 'code', width: 150 },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    { title: '数据范围', dataIndex: 'dataScope', width: 120, render: (val: number) => dataScopeMap[val] || '-' },
                    { title: '状态', dataIndex: 'status', width: 100, type: 'dict', dict: 'status' },
                    { title: '创建时间', dataIndex: 'createTime', width: 180, render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                ] as ColumnDef[]}
            />
            <RoleEdit
                ref={editRef}
                onSuccess={() => tableRef.current?.refresh()}
            />
            <MenuPermission
                ref={menuPermissionRef}
                onSuccess={() => tableRef.current?.refresh()}
            />
        </>
    );
};

export default RoleIndex;
