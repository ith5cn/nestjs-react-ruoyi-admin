import { useRef } from "react";
import { Col, Form, Input, message } from "antd";
import moment from "moment";
import NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { noticeDeleteApi, noticeListApi } from "@/api/system/notice";
import NoticeEdit, { type NoticeEditRef } from "./edit";

const NoticeIndex = () => {
  const editRef = useRef<NoticeEditRef>(null);
  const tableRef = useRef<TableRef>(null);

  return (
    <>
      <NestTable
        ref={tableRef}
        searchFields={
          <>
            <Col span={6}>
              <Form.Item name="title" label="标题">
                <Input placeholder="请输入标题" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="type" label="公告类型">
                <NestSelect dict="notice_type" placeholder="请选择公告类型" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="请输入备注" allowClear />
              </Form.Item>
            </Col>
          </>
        }
        options={{
          api: noticeListApi,
          add: {
            show: true,
            auth: ["system/notice/create"],
            func: () => editRef.current?.open("add"),
          },
          edit: {
            show: true,
            auth: ["system/notice/update"],
            func: (record: any) => editRef.current?.open("edit", record),
          },
          delete: {
            show: true,
            auth: ["system/notice/destroy"],
            func: async (record: any) => {
              await noticeDeleteApi(record.id);
              message.success("删除成功");
              tableRef.current?.refresh();
            },
          },
        }}
        columns={[
                    { title: "标题", dataIndex: "title", width: 160 },
                    { title: "公告类型", dataIndex: "type", width: 140, type: "dict", dict: "notice_type" },
                    { title: "备注", dataIndex: "remark", width: 160 },
                    { title: "创建时间", dataIndex: "createTime", width: 180, render: (text: string) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-" }
        ] as ColumnDef[]}
      />
      <NoticeEdit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />
    </>
  );
};

export default NoticeIndex;
