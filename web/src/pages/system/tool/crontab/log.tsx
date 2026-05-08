import { crontabLogListApi } from "@/api/system/crontab";
import NestTable, { type TableRef } from "@/components/nest-table";
import { PlayCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, Modal } from "antd";
import moment from "moment";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";


export interface CrontabLogRef {
    open: (data: Record<string, any>) => void;
}

// forwardRef 渲染函数的参数顺序是 (props, ref)，ref 是第二个参数
const CrontabLog = forwardRef<CrontabLogRef>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const tableRef = useRef<TableRef>(null)
    const [searchForm, setSearchForm] = useState({
        crontabId: ''
    })

    // 打开弹框
    // 注意：不要在这里手动调用 refresh()
    // 使用 extraSearchParams 后，NestTable 内部会监听它的变化并自动刷新
    const open = (data: Record<string, any>) => {
        setSearchForm({ crontabId: data.id });
        setVisible(true);
    };



    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        open
    }));

    const options = {
        api: crontabLogListApi
    }

    return (
        <Drawer title="任务日志" open={visible} onClose={() => setVisible(false)} width={800}>
            <NestTable
                ref={tableRef}
                options={options}
                extraSearchParams={searchForm}
                operationBeforeExtend={(record) => (
                    <>
                        <Button
                            type="link"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={async () => {
                                Modal.info({
                                    title: '任务日志',
                                    content: record.exceptionInfo,
                                    okText: '确定'
                                })
                            }}
                        >
                            查看
                        </Button>
                    </>
                )}
                columns={[
                    {
                        title: '执行时间',
                        dataIndex: 'startTime',
                        key: 'startTime',
                        render: (text: string) => {
                            return moment(text).format('YYYY-MM-DD HH:mm:ss');
                        }
                    },
                    {
                        title: '执行目标',
                        dataIndex: 'target',
                        key: 'target',
                    },
                    {
                        title: '执行结果',
                        dataIndex: 'status',
                        type: 'dict',
                        dict: 'result',
                        key: 'status',
                    }
                ]}
            />
        </Drawer>
    );
});

export default CrontabLog;