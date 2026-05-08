import { useRef } from "react";
import { Col, Form, Input, message } from "antd";
import moment from "moment";
import NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";
import { operLogDeleteApi, operLogListApi } from "@/api/system/oper-log";
import OperLogEdit, { type OperLogEditRef } from "./edit";

const OperLogIndex = () => {
  const editRef = useRef<OperLogEditRef>(null);
  const tableRef = useRef<TableRef>(null);

  return (
    <>
      <NestTable
        ref={tableRef}
        searchFields={
          <>
            <Col span={6}>
              <Form.Item name="username" label="操作用户">
                <Input placeholder="请输入操作用户" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="serviceName" label="业务名称">
                <Input placeholder="请输入业务名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="router" label="请求路由">
                <Input placeholder="请输入请求路由" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ip" label="操作IP">
                <Input placeholder="请输入操作IP" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="createTime" label="操作时间">
                <Input placeholder="请输入操作时间" allowClear />
              </Form.Item>
            </Col>
          </>
        }
        options={{
          api: operLogListApi,
          add: {
            show: false,
            auth: ["system/oper-log/create"],
            func: () => editRef.current?.open("add"),
          },
          edit: {
            show: false,
            auth: ["system/oper-log/update"],
            func: (record: any) => editRef.current?.open("edit", record),
          },
          delete: {
            show: true,
            auth: ["system/oper-log/destroy"],
            func: async (record: any) => {
              await operLogDeleteApi(record.id);
              message.success("删除成功");
              tableRef.current?.refresh();
            },
          },
        }}
        columns={[
          { title: "操作用户", dataIndex: "username", width: 160 },
          { title: "业务名称", dataIndex: "serviceName", width: 160 },
          { title: "请求路由", dataIndex: "router", width: 160 },
          { title: "操作IP", dataIndex: "ip", width: 160 },
          { title: "操作地点", dataIndex: "ipLocation", width: 160 },
          { title: "操作时间", dataIndex: "createTime", width: 160 },
          { title: "创建时间", dataIndex: "createTime", width: 180, render: (text: string) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-" }
        ] as ColumnDef[]}
      />
      <OperLogEdit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />
    </>
  );
};

export default OperLogIndex;
