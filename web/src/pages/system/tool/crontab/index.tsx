import { crontabDeleteApi, crontabListApi, crontabRunApi } from "@/api/system/crontab";
import NestSelect from "@/components/nest-select";
import NestTable, { type TableRef } from "@/components/nest-table";
import { Button, Col, Form, Input, message } from "antd";
import { FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useRef } from "react";
import CrontabEdit, { type CrontabEditRef } from "./edit";
import CrontabLog, { type CrontabLogRef } from "./log";

export default function Crontab() {
    const tableRef = useRef<TableRef>(null);
    const editRef = useRef<CrontabEditRef>(null);
    const logRef = useRef<CrontabLogRef>(null);

    const options = {
        api: crontabListApi,
        add: {
            show: true,
            auth: ["system/crontab/create"],
            func: () => editRef.current?.open("add"),
        },
        edit: {
            show: true,
            auth: ["system/crontab/update"],
            func: (record: any) => editRef.current?.open("edit", record),
        },
        delete: {
            show: true,
            auth: ["system/crontab/destroy"],
            func: async (record: any) => {
                const res = await crontabDeleteApi(record.id);
                if (res.code === 0) {
                    message.success('删除成功');
                    tableRef.current?.refresh();
                }
            }
        }
    }

    return (
        <>
            <NestTable
                ref={tableRef}
                options={options}
                operationBeforeExtend={(record) => (
                    <>
                    <Button 
                        type="link" 
                        size="small" 
                        icon={<PlayCircleOutlined />} 
                        onClick={async () => {
                            const res = await crontabRunApi(record.id);
                            if (res.code === 0) {
                                message.success(res.data || '执行已触发');
                            }
                        }}
                    >
                        执行一次
                    </Button>
                    <Button type="link" size="small" icon={<FileTextOutlined />} onClick={async()=>{
                        logRef.current?.open({id:record.id});
                    }}>日志</Button>
                    </>
                )}
                columns={[
                    {
                        title: '任务名称',
                        dataIndex: 'name',
                        key: 'name',
                    },
                    {
                        title: '任务类型',
                        dataIndex: 'type',
                        key: 'type',
                        type: 'dict',
                        dict: 'crontab_type'
                    },
                    {
                        title: 'Cron表达式',
                        dataIndex: 'rule',
                        key: 'rule',
                    },
                    {
                        title: '任务状态',
                        dataIndex: 'status',
                        key: 'status',
                        type: 'dict',
                        dict: 'status'
                    },
                    {
                        title: '备注',
                        dataIndex: 'remark',
                        key: 'remark',
                    },
                ]}
            >
                <Col span={6}>
                    <Form.Item name="name" label="任务名称">
                        <Input placeholder="请输入任务名称" allowClear />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="status" label="状态">
                        <NestSelect dict="status" placeholder="请选择状态" />
                    </Form.Item>
                </Col>
            </NestTable>
            <CrontabEdit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />
            <CrontabLog ref={logRef}/>
        </>
    );
}