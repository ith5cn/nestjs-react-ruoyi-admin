import { deleteApi, genCodeGenerateApi, genCodeListApi } from "@/api/system/gencode";
import NestTable, { type TableRef } from "@/components/nest-table";
import { CodeOutlined, EyeOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Space } from "antd";
import { useRef } from "react";
import CodeImportModal, { type CodeImportModalRef } from "./components/codeImportModal";
import GencodeModal, { type GencodeModalRef } from "./components/gen-code-modal";

export default function GenCodeIndex() {
  const tableRef = useRef<TableRef>(null);
  const codeImportModalRef = useRef<CodeImportModalRef>(null);
  const gencodeModalRef = useRef<GencodeModalRef>(null);

  const refresh = () => tableRef.current?.refresh();

  return (
    <>
      <NestTable
        ref={tableRef}
        BeforeHeaderExtend={
          <Button
            color="primary"
            variant="outlined"
            icon={<LogoutOutlined />}
            onClick={() => codeImportModalRef.current?.open()}
          >
            装载数据表
          </Button>
        }
        searchFields={
          <>
            <Col span={6}>
              <Form.Item name="table_name" label="表名">
                <Input placeholder="请输入表名" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="source" label="表来源">
                <Input placeholder="请输入表来源" allowClear />
              </Form.Item>
            </Col>
          </>
        }
        options={{
          api: genCodeListApi,
          edit: {
            show: true,
            auth: [],
            func: async (record) => {
              gencodeModalRef.current?.open(record);
            },
          },
          delete: {
            show: true,
            auth: [],
            func: async (record) => {
              await deleteApi({ ids: [record.id] });
              message.success("删除成功");
              refresh();
            },
          },
        }}
        operationAfterExtend={(record) => (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => gencodeModalRef.current?.preview(record)}
            >
              预览
            </Button>
            <Button
              type="link"
              size="small"
              icon={<CodeOutlined />}
              onClick={async () => {
                await genCodeGenerateApi(record.id);
                message.success("生成代码成功");
                refresh();
              }}
            >
              生成
            </Button>
          </Space>
        )}
        columns={[
          { title: "表名", dataIndex: "table_name", key: "table_name" },
          { title: "表描述", dataIndex: "table_comment", key: "table_comment" },
          { title: "业务名称", dataIndex: "business_name", key: "business_name" },
          { title: "菜单名称", dataIndex: "menu_name", key: "menu_name" },
          { title: "表来源", dataIndex: "source", key: "source" },
          { title: "创建时间", dataIndex: "createTime", key: "createTime" },
        ]}
      />

      <CodeImportModal ref={codeImportModalRef} onSuccess={refresh} />
      <GencodeModal ref={gencodeModalRef} onSuccess={refresh} />
    </>
  );
}