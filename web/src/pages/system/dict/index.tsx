import { useRef, useState } from "react";
import NestTable, { type ColumnDef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { dictTypeListApi, dictTypeDeleteApi, dictTypeUpdateApi } from "@/api/system/dict";
import { Col, Form, Input, Switch, message, Button } from "antd";
import moment from "moment";
import Edit, { type EditRef } from "./edit";
import DictDataIndex from "./data-index";
import { UnorderedListOutlined } from "@ant-design/icons";

// 状态切换开关组件
const StatusSwitch = ({ record }: { record: any }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(record.status);

    const onChange = async (checked: boolean) => {
        setLoading(true);
        const newStatus = checked ? 1 : 2;
        try {
            const res = await dictTypeUpdateApi(record.id, { ...record, status: newStatus });
            if (res.code === 200 || res.code === 0) {
                setStatus(newStatus);
                message.success('状态更新成功');
            } else {
                message.error(res.message || '状态更新失败');
            }
        } catch (error) {
            message.error('状态更新异常');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Switch
            checked={status === 1}
            loading={loading}
            onChange={onChange}
            checkedChildren="正常"
            unCheckedChildren="停用"
        />
    )
}

const DictTypeIndex = () => {
    const tableRef = useRef<any>(null);
    const editRef = useRef<EditRef>(null);

    // 数据字典层相关状态
    const [dataModalOpen, setDataModalOpen] = useState(false);
    const [currentDictType, setCurrentDictType] = useState<any>(null);

    const handleOpenData = (record: any) => {
        setCurrentDictType(record);
        setDataModalOpen(true);
    };

    return (
        <div className="flex h-full gap-4">
            <div className="flex-1 bg-white">
                <NestTable
                    ref={tableRef}
                    options={{
                        api: dictTypeListApi,
                        deleteApi: dictTypeDeleteApi,
                        title: "字典类型",
                        searchColSpan: 6,
                        add: {
                            func: () => editRef.current?.open(),
                            auth: ['/system/dict-type/create'],
                            show: true
                        },
                        edit: {
                            func: (record: any) => editRef.current?.open(record),
                            auth: ['/system/dict-type/update'],
                            show: true
                        },
                        delete: {
                            func: async (record: any) => {
                                const res = await dictTypeDeleteApi(record.id)
                                if (res.code === 0) {
                                    message.success("删除成功")
                                    tableRef.current?.refresh();
                                }
                            },
                            auth: ['/system/dict-type/destroy'],
                            show: true
                        },
                        operationColumnWidth: 220
                    }}
                    searchFields={
                        <>
                            <Col span={6}>
                                <Form.Item name="name" label="字典名称">
                                    <Input placeholder="输入字典名称搜索" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="code" label="字典标示">
                                    <Input placeholder="输入字典标示搜索" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="status" label="状态">
                                    <NestSelect dict="status" placeholder="选择状态" allowClear />
                                </Form.Item>
                            </Col>
                        </>
                    }
                    columns={[
                        { title: '字典名称', dataIndex: 'name' },
                        { title: '字典标示', dataIndex: 'code' },
                        { title: '状态', dataIndex: 'status', render: (_: any, record: any) => <StatusSwitch record={record} /> },
                        { title: '创建时间', dataIndex: 'createTime', render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                    ] as ColumnDef[]}
                    operationBeforeExtend={(record) => {
                        return (
                            <Button icon={<UnorderedListOutlined />} type="link" onClick={() => handleOpenData(record)}>
                                管理数据
                            </Button>
                        )
                    }}

                />
            </div>

            <Edit ref={editRef} onSuccess={() => {
                tableRef.current?.refresh()
            }} />

            {/* 字典数据全屏弹窗 */}
            {dataModalOpen && currentDictType && (
                <DictDataIndex
                    dictType={currentDictType}
                    onClose={() => {
                        setDataModalOpen(false);
                        setCurrentDictType(null);
                    }}
                />
            )}
        </div>
    );
};

export default DictTypeIndex;
