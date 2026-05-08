import { Checkbox, Input, InputNumber, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { GencodeColumnRecord } from "./gen-code-modal";
import { queryType, viewComponent } from "../js/var";

interface GencodeColumnsProps {
  data: GencodeColumnRecord[];
  onChange: (rows: GencodeColumnRecord[]) => void;
  dictTypeOptions: Array<{ label: string; value: string }>;
}

const DICT_SELECT_VALUE = "saSelect";
const RICH_TEXT_VALUE = "wangEditor";

const GencodeColumns = ({ data, onChange, dictTypeOptions }: GencodeColumnsProps) => {
  const updateRow = (index: number, patch: Partial<GencodeColumnRecord>) => {
    const next = [...data];
    next[index] = { ...next[index], ...patch };
    if ((patch.view_type && patch.view_type !== DICT_SELECT_VALUE) || next[index].view_type !== DICT_SELECT_VALUE) {
      next[index].dict_type = undefined;
    }
    if ((patch.view_type && patch.view_type === RICH_TEXT_VALUE) || next[index].view_type === RICH_TEXT_VALUE) {
      next[index].is_query = 1;
      next[index].query_type = "eq";
    }
    onChange(next);
  };

  const toggleFlag = (index: number, key: keyof GencodeColumnRecord, checked: boolean) => {
    if (key === "is_edit") {
      updateRow(index, {
        is_insert: checked ? 2 : 1,
        is_edit: checked ? 2 : 1,
      });
      return;
    }
    updateRow(index, { [key]: checked ? 2 : 1 } as Partial<GencodeColumnRecord>);
  };

  const columns: ColumnsType<GencodeColumnRecord> = [
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
      width: 90,
      render: (value, _record, index) => (
        <InputNumber value={value} min={0} onChange={(next) => updateRow(index, { sort: Number(next || 0) })} />
      ),
    },
    {
      title: "字段名称",
      dataIndex: "column_name",
      key: "column_name",
      width: 180,
      render: (value) => <Input value={value} disabled />,
    },
    {
      title: "字段描述",
      dataIndex: "column_comment",
      key: "column_comment",
      width: 180,
      render: (value, _record, index) => (
        <Input value={value} onChange={(event) => updateRow(index, { column_comment: event.target.value })} />
      ),
    },
    {
      title: "字段类型",
      dataIndex: "column_type",
      key: "column_type",
      width: 140,
      render: (value) => <Input value={value} disabled />,
    },
    {
      title: "必填",
      dataIndex: "is_required",
      key: "is_required",
      width: 80,
      render: (value, _record, index) => (
        <Checkbox checked={value === 2} onChange={(event) => toggleFlag(index, "is_required", event.target.checked)} />
      ),
    },
    {
      title: "表单",
      dataIndex: "is_edit",
      key: "is_edit",
      width: 80,
      render: (value, record, index) => (
        <Checkbox
          checked={value === 2}
          disabled={record.is_pk === 2}
          onChange={(event) => toggleFlag(index, "is_edit", event.target.checked)}
        />
      ),
    },
    {
      title: "列表",
      dataIndex: "is_list",
      key: "is_list",
      width: 80,
      render: (value, _record, index) => (
        <Checkbox checked={value === 2} onChange={(event) => toggleFlag(index, "is_list", event.target.checked)} />
      ),
    },
    {
      title: "查询",
      dataIndex: "is_query",
      key: "is_query",
      width: 80,
      render: (value, _record, index) => (
        <Checkbox
          checked={value === 2}
          disabled={data[index]?.view_type === RICH_TEXT_VALUE}
          onChange={(event) => toggleFlag(index, "is_query", event.target.checked)}
        />
      ),
    },
    {
      title: "排序字段",
      dataIndex: "is_sort",
      key: "is_sort",
      width: 100,
      render: (value, _record, index) => (
        <Checkbox checked={value === 2} onChange={(event) => toggleFlag(index, "is_sort", event.target.checked)} />
      ),
    },
    {
      title: "查询方式",
      dataIndex: "query_type",
      key: "query_type",
      width: 130,
      render: (value, _record, index) => (
        <Select style={{width:'100px'}} value={value} options={queryType} onChange={(next) => updateRow(index, { query_type: next })} />
      ),
    },
    {
      title: "页面组件",
      dataIndex: "view_type",
      key: "view_type",
      width: 160,
      render: (value, _record, index) => (
        <Select style={{width:'100px'}} value={value} options={viewComponent} onChange={(next) => updateRow(index, { view_type: next })} />
      ),
    },  
    {
      title: "数据字典",
      dataIndex: "dict_type",
      key: "dict_type",
      width: 180,
      render: (value, record, index) => (
        <Select
          style={{width:'100px'}}
          value={value}
          allowClear
          disabled={record.view_type !== DICT_SELECT_VALUE}
          options={dictTypeOptions}
          onChange={(next) => updateRow(index, { dict_type: next })}
        />
      ),
    },
  ];

  return <Table rowKey={(record) => String(record.id ?? record.column_name)} columns={columns} dataSource={data} pagination={false} scroll={{ x: 1400 }} />;
};

export default GencodeColumns;
