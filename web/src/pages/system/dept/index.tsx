import { useRef } from "react";
import { Col, Form, Input } from "antd";
import NestSelect from "@/components/nest-select";
import NestTable, {
  type TableRef,
  type ColumnDef,
} from "@/components/nest-table";
import { deptDeleteApi, deptListApi } from "@/api/system/dept";
import { message } from "antd";
import moment from "moment";
import DeptEdit, { type DeptEditRef } from "./edit";
import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

const DeptIndex = () => {
  const editRef = useRef<DeptEditRef>(null);
  const tableRef = useRef<TableRef>(null);

  return (
    <>
      <NestTable
        ref={tableRef}
        options={{
          api: deptListApi,
          add: {
            show: true,
            auth: ["/system/dept/create"],
            func: () => editRef.current?.open("add"),
          },
          edit: {
            show: true,
            auth: ["/system/dept/update"],
            func: (record: any) => editRef.current?.open("edit", record),
          },
          delete: {
            show: true,
            auth: ["/system/dept/destroy"],
            func: async (record: any) => {
              const res = await deptDeleteApi(record.id);
              if (res.code === 0) {
                message.success("删除成功");
                tableRef.current?.refresh();
              }
            },
          },
        }}
        operationBeforeExtend={(record) => (
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              editRef.current?.open("add");
              editRef.current?.setFormData({ parentId: record.id });
            }}
          >
            新增
          </Button>
        )}
        columns={
          [
            { title: "部门名称", dataIndex: "name", width: 200 },
            { title: "排序", dataIndex: "sort", width: 100 },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              type: "dict",
              dict: "status",
            },
            {
              title: "创建时间",
              dataIndex: "createTime",
              width: 180,
              render: (text: string) =>
                text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-",
            },
          ] as ColumnDef[]
        }
      >
        <Col span={6}>
          <Form.Item name="name" label="部门名称">
            <Input placeholder="请输入部门名称" allowClear />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="status" label="状态">
            <NestSelect dict="status" placeholder="请选择状态" />
          </Form.Item>
        </Col>
      </NestTable>
      <DeptEdit ref={editRef} onSuccess={() => tableRef.current?.refresh()} />
    </>
  );
};

export default DeptIndex;
