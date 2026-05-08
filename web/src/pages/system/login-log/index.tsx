import { useRef } from "react";
import { Col, Form, Input, message } from "antd";
import moment from "moment";
import NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { loginLogDeleteApi, loginLogListApi } from "@/api/system/login-log";
import NestSystemLoginLogEdit, { type NestSystemLoginLogEditRef } from "./edit";

const NestSystemLoginLogIndex = () => {
  const editRef = useRef<NestSystemLoginLogEditRef>(null);
  const tableRef = useRef<TableRef>(null);

  return (
    <>
      <NestTable
        ref={tableRef}
        searchFields={
          <>
            <Col span={6}>
              <Form.Item name="username" label="登录用户">
                <Input placeholder="请输入登录用户" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="登录状态">
                <NestSelect dict="result_status" placeholder="请选择登录状态" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="ip" label="登录IP">
                <Input placeholder="请输入登录IP" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="loginTime" label="登录时间">
                <Input placeholder="请输入登录时间" allowClear />
              </Form.Item>
            </Col>
          </>
        }
        options={{
          api: loginLogListApi,
          add: {
            show: true,
            auth: ["system/login-log/create"],
            func: () => editRef.current?.open("add"),
          },
          edit: {
            show: true,
            auth: ["system/login-log/update"],
            func: (record: any) => editRef.current?.open("edit", record),
          },
          delete: {
            show: true,
            auth: ["system/login-log/destroy"],
            func: async (record: any) => {
              await loginLogDeleteApi(record.id);
              message.success("删除成功");
              tableRef.current?.refresh();
            },
          },
        }}
        columns={[
          { title: "登录用户", dataIndex: "username", width: 160 },
          { title: "登录状态", dataIndex: "status", width: 140, type: "dict", dict: "result_status" },
          { title: "登录IP", dataIndex: "ip", width: 160 },
          { title: "登录地点", dataIndex: "ipLocation", width: 160 },
          { title: "操作系统", dataIndex: "os", width: 160 },
          { title: "浏览器", dataIndex: "browser", width: 160 },
          { title: "登录时间", dataIndex: "loginTime", width: 160 },
          { title: "创建时间", dataIndex: "createTime", width: 180, render: (text: string) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-" }
        ] as ColumnDef[]}
      />
      <NestSystemLoginLogEdit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />
    </>
  );
};

export default NestSystemLoginLogIndex;
