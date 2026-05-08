import React, { useRef, useState } from "react";
import NestTable, { type ColumnDef } from "@/components/nest-table";
import { dictDataListApi, dictDataDeleteApi, dictDataUpdateApi } from "@/api/system/dict";
import { Col, Form, Input, Switch, message, Modal, Tag } from "antd";
import NestSelect from "@/components/nest-select";
import moment from "moment";
import DataEdit, { type DataEditRef } from "./data-edit";

// 状态切换开关组件
const StatusSwitch = ({ record }: { record: any }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(record.status);

    const onChange = async (checked: boolean) => {
        setLoading(true);
        const newStatus = checked ? 1 : 2;
        try {
            const res = await dictDataUpdateApi(record.id, { ...record, status: newStatus });
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

interface DictDataIndexProps {
    dictType: any;
    onClose: () => void;
}

const DictDataIndex: React.FC<DictDataIndexProps> = ({ dictType, onClose }) => {
    const tableRef = useRef<any>(null);
    const editRef = useRef<DataEditRef>(null);

    // 覆盖 list api，强制带上 typeId
    const apiWithTypeId = async (params: any) => {
        return await dictDataListApi({ ...params, typeId: dictType.id });
    }

    return (
        <Modal
            title={`维护 ${dictType.name} 字典数据`}
            open={true}
            onCancel={onClose}
            width="100vw"
            style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw' }}
            bodyStyle={{ height: 'calc(100vh - 55px)', overflow: 'auto' }}
            footer={null}
            destroyOnClose
        >
            <div className="bg-white h-full">
                <NestTable
                    ref={tableRef}
                    options={{
                        api: apiWithTypeId,
                        add: {
                            func: () => editRef.current?.open(dictType.id),
                            auth: ['/system/dict-type/update'],
                            show: true
                        },
                        edit: {
                            func: (record: any) => editRef.current?.open(dictType.id, record),
                            auth: ['/system/dict-type/update'],
                            show: true
                        },
                        delete: {
                            func: async (record: any) => {
                                const res = await dictDataDeleteApi(record.id);
                                if (res.code === 0 || res.code === 200) {
                                    message.success("删除成功");
                                    tableRef.current?.refresh();
                                } else {
                                    message.error(res.message || "删除失败");
                                }
                            },
                            auth: ['/system/dict-type/update'],
                            show: true
                        },
                        operationColumnWidth: 150
                    }}
                    searchFields={
                        <>
                            <Col span={8}>
                                <Form.Item name="label" label="字典标签">
                                    <Input placeholder="输入标签搜索" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="status" label="状态">
                                    <NestSelect dict="status" placeholder="选择状态" allowClear />
                                </Form.Item>
                            </Col>
                        </>
                    }
                    columns={[
                        { title: '字典标签', dataIndex: 'label', render: (text: any, record: any) => record.color ? <Tag color={record.color}>{text}</Tag> : <span>{text}</span> },
                        { title: '字典键值', dataIndex: 'value' },
                        { title: '颜色', dataIndex: 'color', render: (text: any) => text ? <span style={{ color: text }}>{text}</span> : '-' },
                        { title: '排序', dataIndex: 'sort' },
                        { title: '状态', dataIndex: 'status', render: (_: any, record: any) => <StatusSwitch record={record} /> },
                        { title: '创建时间', dataIndex: 'createTime', render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                    ] as ColumnDef[]}
                />
            </div>

            <DataEdit ref={editRef} onSuccess={() => {
                tableRef.current?.refresh()
            }} />
        </Modal>
    );
};

export default DictDataIndex;
