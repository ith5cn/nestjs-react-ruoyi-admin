import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Col, Form, Input, Modal, message } from "antd";
import NestTable, { type ColumnDef, type TableRef } from "@/components/nest-table";
import {
  configDeleteApi,
  getConfigListApi,
} from "@/api/system/config";
import ConfigItemEdit, { type ConfigItemEditRef } from "./config-item-edit";

export interface ConfigManageModalRef {
  open: (groupId: number) => void;
}

interface ConfigManageModalProps {
  onClose?: () => void;
}

const ConfigManageModal = forwardRef<ConfigManageModalRef, ConfigManageModalProps>(({ onClose }, ref) => {
  const [visible, setVisible] = useState(false);
  const [groupId, setGroupId] = useState<number>(0);
  const tableRef = useRef<TableRef>(null);
  const editRef = useRef<ConfigItemEditRef>(null);

  const open = (nextGroupId: number) => {
    setGroupId(nextGroupId);
    setVisible(true);
    setTimeout(() => tableRef.current?.refresh(), 0);
  };

  const close = () => {
    setVisible(false);
    onClose?.();
  };

  useImperativeHandle(ref, () => ({ open }));

  return (
    <>
      <Modal title="管理配置项" open={visible} footer={null} width="95%" onCancel={close} destroyOnClose>
        <NestTable
          ref={tableRef}
          options={{
            api: getConfigListApi,
            pageSize: 999,
            add: {
              show: true,
              auth: ["system/config/create"],
              func: () => editRef.current?.open("add", { group_id: groupId }),
            },
            edit: {
              show: true,
              auth: ["system/config/update"],
              func: (record: any) => editRef.current?.open("edit", record),
            },
            delete: {
              show: true,
              auth: ["system/config/destroy"],
              func: async (record: any) => {
                await configDeleteApi(record.id);
                message.success("删除成功");
                tableRef.current?.refresh();
                onClose?.();
              },
            },
          }}
          extraSearchParams={{ group_id: groupId, orderBy: "sort", orderType: "DESC" }}
          searchFields={
            <>
              <Col span={6}>
                <Form.Item name="name" label="配置标题">
                  <Input placeholder="请输入配置标题" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="key" label="配置标识">
                  <Input placeholder="请输入配置标识" allowClear />
                </Form.Item>
              </Col>
            </>
          }
          columns={[
            { title: "配置标题", dataIndex: "name", width: 180 },
            { title: "配置标识", dataIndex: "key", width: 180 },
            { title: "配置值", dataIndex: "value", width: 240 },
            { title: "排序", dataIndex: "sort", width: 100 },
            { title: "输入组件", dataIndex: "input_type", width: 120 },
            { title: "配置说明", dataIndex: "remark", width: 220 },
          ] as ColumnDef[]}
        />
      </Modal>
      <ConfigItemEdit
        ref={editRef}
        onSuccess={() => {
          tableRef.current?.refresh();
          onClose?.();
        }}
      />
    </>
  );
});

ConfigManageModal.displayName = "ConfigManageModal";

export default ConfigManageModal;
