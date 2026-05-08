import { getDatasourcesApi, getDbTablesBySourceApi, importTablesApi } from "@/api/system/gencode";
import NestTable, { type TableRef } from "@/components/nest-table";
import { Col, Form, Input, message, Modal, Select } from "antd";
import moment from "moment";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CodeImportModalRef {
  open: () => void;
}

interface CodeImportModalProps {
  onSuccess?: () => void;
}

const CodeImportModal = forwardRef<CodeImportModalRef, CodeImportModalProps>(({ onSuccess }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datasourceData, setDatasourceData] = useState<any[]>([]);
  const tableRef = useRef<TableRef>(null);
  const [searchForm, setSearchForm] = useState({ source: "nest_system" });

  const handleOk = async () => {
    const selectedRows = tableRef.current?.getSelectedRows() ?? [];
    if (selectedRows.length === 0) {
      message.warning("请选择要导入的数据表");
      return;
    }

    const tables = selectedRows.map((item: any) => ({
      tableName: item.TABLE_NAME,
      tableComment: item.TABLE_COMMENT,
    }));

    await importTablesApi({ source: searchForm.source, tables });
    message.success("装载成功");
    onSuccess?.();
    setIsModalOpen(false);
  };

  const getDatasources = async () => {
    const res = await getDatasourcesApi();
    setDatasourceData(res.data);
  };

  const handleDatasourceChange = (value: string) => {
    setSearchForm({ source: value });
    tableRef.current?.clearSelection();
  };

  const open = async () => {
    setIsModalOpen(true);
    tableRef.current?.clearSelection();
  };

  useImperativeHandle(ref, () => ({ open }));

  useEffect(() => {
    getDatasources();
  }, []);

  return (
    <Modal
      title="装载数据表"
      open={isModalOpen}
      width="100%"
      style={{ top: 0, height: "100vh", maxWidth: "100vw" }}
      bodyStyle={{ height: "calc(100vh - 120px)" }}
      onOk={handleOk}
      onCancel={() => setIsModalOpen(false)}
    >
      <NestTable
        ref={tableRef}
        rowKey="TABLE_NAME"
        extraSearchParams={searchForm}
        searchFields={
          <>
            <Col span={6}>
              <Form.Item name="source" label="数据源">
                <Select
                  onChange={handleDatasourceChange}
                  value={searchForm.source}
                  defaultValue={searchForm.source}
                  options={datasourceData}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="keyword" label="表名称">
                <Input placeholder="请输入数据表名称" allowClear />
              </Form.Item>
            </Col>
          </>
        }
        options={{ api: getDbTablesBySourceApi }}
        columns={[
          { title: "表名称", dataIndex: "TABLE_NAME", key: "TABLE_NAME" },
          { title: "表注释", dataIndex: "TABLE_COMMENT", key: "TABLE_COMMENT" },
          { title: "引擎", dataIndex: "ENGINE", key: "ENGINE" },
          { title: "字符集", dataIndex: "TABLE_COLLATION", key: "TABLE_COLLATION" },
          {
            title: "创建时间",
            dataIndex: "CREATE_TIME",
            key: "CREATE_TIME",
            render: (text: string) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
          },
        ]}
      />
    </Modal>
  );
});

CodeImportModal.displayName = "CodeImportModal";

export default CodeImportModal;
