import { menuDeleteApi, menuListApi } from "@/api/system/menu";
import NestTable, { type TableRef, type ColumnDef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { Button, Col, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import MenuEdit, { type MenuEditRef } from "./edit";
import { PlusOutlined } from "@ant-design/icons";
import { renderIcon } from "@/utils/routeUtils";
import moment from "moment";

const index = () => {

    const menuEditRef = useRef<MenuEditRef>(null);
    const tableRef = useRef<TableRef>(null)

    const [options] = useState({
        api: menuListApi,
        pageSize: 10,
        add: {
            show: true,
            auth: ['system/menu/create'],
            func: async () => {
                // alert('新增菜单')
                menuEditRef.current?.open()
            },
        },
        delete: {
            show: true,
            auth: ['system/menu/destroy'],
            func: async (record: any) => {
                console.log('record', record)
                await menuDeleteApi(record.id)
                tableRef.current?.refresh()
            },
        },
        edit: {
            show: true,
            auth: ['system/menu/update'],
            func: async (record: any) => {
                menuEditRef.current?.open('edit')
                menuEditRef.current?.setFormData(record)
            },
        }
    })

    useEffect(() => {
        tableRef.current?.refresh()
    }, [])

    return (
        <>
            <NestTable
                ref={tableRef}
                options={options}
                searchFields={
                    <>
                        <Col span={6}>
                            <Form.Item label="菜单名称" name="name">
                                <Input placeholder="请输入菜单名称" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="菜单标识" name="code">
                                <Input placeholder="请输入菜单标识" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="菜单状态" name="status">
                                <NestSelect dict="status" placeholder="请选择菜单状态" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                    </>
                }
                operationBeforeExtend={(record) => (
                    record.type === 'M' ? (
                        <Button type="link" icon={<PlusOutlined />} onClick={() => {
                            menuEditRef.current?.open('add')
                            menuEditRef.current?.setFormData({ parentId: record.id })
                        }}>
                            新增
                        </Button>
                    ) : null
                )}
                columns={[
                    { title: '菜单名称', dataIndex: 'name', width: 160 },
                    { title: '菜单类型', dataIndex: 'type' },
                    { title: '图标', dataIndex: 'icon', render: (icon: string) => <span style={{ fontSize: '16px' }}>{renderIcon(icon)}</span> },
                    { title: '菜单标识', dataIndex: 'code' },
                    { title: '路由地址', dataIndex: 'route' },
                    { title: '视图组件', dataIndex: 'component' },
                    { title: '排序', dataIndex: 'sort' },
                    { title: '隐藏', dataIndex: 'isHidden', render: (val: number) => val === 1 ? '是' : '否' },
                    { title: '状态', dataIndex: 'status', type: 'dict', dict: 'status' },
                    { title: '创建时间', dataIndex: 'createTime', render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                ] as ColumnDef[]} />

            <MenuEdit ref={menuEditRef} onSuccess={() => {
                tableRef.current?.refresh()
            }} />

        </>


    );
};

export default index;