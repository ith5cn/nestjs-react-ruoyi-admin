import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Form,
  Modal,
  Popover,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import defaultOptions from "./defaultOption";
import {
  ColumnHeightOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UploadOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { isFunction, merge } from "lodash";
import useUserStore from "@/store/useUserStore";
import useDictStore from "@/store/useDictStore";
import NestImport, { type NestImportRef } from "@/components/nest-import";
import type { TableProps } from "antd/lib/table";

export interface ColumnDef {
  title: string;
  dataIndex: string;
  key?: string;
  width?: number;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  render?: (value: any, record: any, index: number) => ReactNode;
  type?: "dict";
  dict?: string;
}

interface NestTableOptions {
  id?: string;
  title?: string;
  searchColSpan?: number;
  api?: (params: Record<string, any>) => Promise<any>;
  deleteApi?: (id: number | string) => Promise<any>;
  pageSize?: number;
  add?: {
    func?: () => void;
    auth?: string[];
    text?: string;
    show?: boolean;
  };
  edit?: {
    func?: (record: any) => void;
    auth?: string[];
    text?: string;
    show?: boolean;
  };
  delete?: {
    func?: (record: any) => void;
    auth?: string[];
    text?: string;
    confirmText?: string;
    show?: boolean;
    batch?: boolean;
  };
  import?: {
    url?: string;
    params?: Record<string, any>;
    templateUrl?: string;
    auth?: string[];
    text?: string;
    show?: boolean;
  };
  operationColumn?: boolean;
  operationColumnWidth?: number;
  operationColumnText?: string;
}

interface NestTableProps {
  children?: ReactNode;
  searchFields?: ReactNode;
  operationBeforeExtend?: (record: any) => ReactNode;
  operationAfterExtend?: (record: any) => ReactNode;
  operationCell?: (record: any) => ReactNode;
  options?: NestTableOptions;
  searchForm?: Record<string, any>;
  extraSearchParams?: Record<string, any>;
  showCount?: number;
  columns?: ColumnDef[] | ReactNode;
  operationColumn?: ReactNode;
  operationColumnWidth?: number;
  operationColumnText?: string;
  add?: ReactNode;
  edit?: ReactNode;
  delete?: ReactNode;
  BeforeHeaderExtend?: ReactNode;
  /** 行唯一标识字段，默认 'id' */
  rowKey?: string;
}

export interface TableRef {
  refresh: () => void;
  updateRecord?: (index: number, updatedFields: Record<string, any>) => void;
  /** 获取当前选中行的数据 */
  getSelectedRows: () => any[];
  /** 获取当前选中行的 key 列表 */
  getSelectedKeys: () => React.Key[];
  /** 清空选中状态 */
  clearSelection: () => void;
}

type DensityType = "default" | "middle" | "compact";

interface PersistedTablePreference {
  density?: DensityType;
  columnVisibility?: Record<string, boolean>;
}

interface InternalColumnDef extends ColumnDef {
  columnKey: string;
}

const densityConfig: Record<
  DensityType,
  { label: string; size: "small" | "middle"; className: string }
> = {
  default: { label: "默认", size: "small", className: "" },
  middle: { label: "中等", size: "middle", className: "" },
  compact: { label: "紧凑", size: "small", className: "nest-table-compact" },
};

const createRuntimeTableId = () =>
  `runtime-${Math.random().toString(36).slice(2, 10)}`;

const flattenFields = (children: ReactNode): ReactNode[] => {
  const result: ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      result.push(...flattenFields((child.props as { children?: ReactNode }).children));
    } else if (child != null && child !== false && child !== true) {
      result.push(child);
    }
  });
  return result;
};

const NestTable = forwardRef<TableRef, NestTableProps>(
  (
    {
      children,
      searchFields,
      options,
      searchForm,
      extraSearchParams,
      showCount = 3,
      columns,
      operationBeforeExtend,
      operationAfterExtend,
      operationCell,
      BeforeHeaderExtend,
      rowKey = "id",
    },
    ref,
  ) => {
    const tableOptions = useMemo(
      () => merge({}, defaultOptions, options) as NestTableOptions,
      [options],
    );
    const tableIdRef = useRef(tableOptions.id ?? createRuntimeTableId());
    const persistKey = tableOptions.id
      ? `nest-table:${tableIdRef.current}`
      : undefined;

    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [columnSettingOpen, setColumnSettingOpen] = useState(false);
    const [density, setDensity] = useState<DensityType>("default");
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
      {},
    );
    const permissions = useUserStore((state) => state.permissions);
    const { dictMap, isLoaded, fetchDictAll } = useDictStore();
    const importRef = useRef<NestImportRef>(null);
    const [form] = Form.useForm();

    useEffect(() => {
      if (!isLoaded) fetchDictAll();
    }, [isLoaded, fetchDictAll]);

    const hasAuth = (authCodes?: string[]) => {
      console.log("authCodes", authCodes)
      if (!authCodes || authCodes.length === 0) return true;
      if (permissions.includes("*")) return true;
      return authCodes.some((code) => permissions.includes(code));
    };

    const [tableData, setTableData] = useState<{ total: number; data: any[] }>({
      total: 0,
      data: [],
    });
    const [requestParams, setRequestParams] = useState({
      page: 1,
      limit: tableOptions.pageSize ?? 10,
      ...searchForm,
    });

    const fieldList = flattenFields(searchFields || children);
    const needCollapse = fieldList.length > showCount;
    const visibleFields = expanded ? fieldList : fieldList.slice(0, showCount);

    useEffect(() => {
      if (!persistKey) return;
      try {
        const raw = window.localStorage.getItem(persistKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedTablePreference;
        if (parsed.density) setDensity(parsed.density);
        if (parsed.columnVisibility) setColumnVisibility(parsed.columnVisibility);
      } catch (error) {
        console.warn("Failed to read nest-table preferences", error);
      }
    }, [persistKey]);

    const persistPreferences = (
      nextDensity: DensityType,
      nextColumnVisibility: Record<string, boolean>,
    ) => {
      if (!persistKey) return;
      const payload: PersistedTablePreference = {
        density: nextDensity,
        columnVisibility: nextColumnVisibility,
      };
      window.localStorage.setItem(persistKey, JSON.stringify(payload));
    };

    const fetchData = async (params: Record<string, any>) => {
      if (!isFunction(tableOptions.api)) return;
      setLoading(true);
      try {
        const response = await tableOptions.api({
          ...params,
          ...extraSearchParams,
        });

        if (response.data && response.data.data) {
          setTableData({ total: response.data.total, data: response.data.data });
        } else {
          setTableData({ total: 0, data: response.data });
        }
      } finally {
        setLoading(false);
      }
    };

    const onFinish = (values: any) => {
      const params = {
        page: 1,
        limit: tableOptions.pageSize ?? 10,
        ...values,
      };
      setRequestParams(params);
      fetchData(params);
    };

    const onReset = () => {
      form.resetFields();
    };

    const refresh = () => {
      fetchData(requestParams);
    };

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const updateRecord = (index: number, updatedFields: Record<string, any>) => {
      setTableData((previous) => {
        const nextData = [...previous.data];
        if (nextData[index]) {
          nextData[index] = { ...nextData[index], ...updatedFields };
        }
        return { ...previous, data: nextData };
      });
    };

    const getSelectedRows = () => selectedRows;
    const getSelectedKeys = () => selectedRowKeys;
    const clearSelection = () => {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    };

    useImperativeHandle(ref, () => ({
      refresh,
      updateRecord,
      getSelectedRows,
      getSelectedKeys,
      clearSelection,
    }));

    useEffect(() => {
      fetchData(requestParams);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(extraSearchParams)]);

    const handleTableChange = (pagination: any) => {
      const params = {
        ...requestParams,
        page: pagination.current,
        limit: pagination.pageSize,
      };
      setRequestParams(params);
      fetchData(params);
    };

    const baseColumns = useMemo<InternalColumnDef[]>(() => {
      if (!Array.isArray(columns)) return [];

      return (columns as ColumnDef[]).map((column) => ({
        ...column,
        columnKey: String(column.key ?? column.dataIndex),
      }));
    }, [columns]);

    const normalizedColumns = useMemo<ColumnsType<any> | undefined>(() => {
      if (!Array.isArray(columns)) return undefined;

      const mappedColumns: ColumnsType<any> = baseColumns
        .filter((column) => columnVisibility[column.columnKey] !== false)
        .map((column) => ({
          title: column.title,
          dataIndex: column.dataIndex,
          key: column.columnKey,
          width: column.width,
          fixed: column.fixed,
          align: column.align,
          render: (value: any, record: any, index: number) => {
            if (column.type === "dict" && column.dict) {
              const item = (dictMap[column.dict] ?? []).find(
                (dictItem) => dictItem.value === String(value),
              );
              return item
                ? item.color
                  ? <Tag color={item.color}>{item.label}</Tag>
                  : item.label
                : value ?? "-";
            }

            return column.render ? column.render(value, record, index) : value;
          },
        }));

      if (tableOptions.operationColumn) {
        mappedColumns.push({
          title: tableOptions.operationColumnText,
          dataIndex: "action",
          key: "__operation__",
          fixed: "right",
          width: tableOptions.operationColumnWidth,
          render: (_value: any, record: any) => {
            if (operationCell) {
              const customRender = operationCell(record);
              if (customRender !== undefined) {
                return customRender;
              }
            }

            return (
              <Space size="small">
                {operationBeforeExtend?.(record)}
                {tableOptions.edit?.show && hasAuth(tableOptions.edit.auth) && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => tableOptions.edit?.func?.(record)}
                  >
                    {tableOptions.edit.text}
                  </Button>
                )}
                {tableOptions.delete?.show && hasAuth(tableOptions.delete.auth) && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: "提示",
                        content:
                          tableOptions.delete?.confirmText ?? "确定要删除吗？",
                        onOk: () => {
                          tableOptions.delete?.func?.(record);
                        },
                      });
                    }}
                  >
                    {tableOptions.delete.text}
                  </Button>
                )}
                {operationAfterExtend?.(record)}
              </Space>
            );
          },
        });
      }

      return mappedColumns;
    }, [
      baseColumns,
      columnVisibility,
      columns,
      dictMap,
      operationAfterExtend,
      operationBeforeExtend,
      operationCell,
      permissions,
      tableOptions.delete,
      tableOptions.edit,
      tableOptions.operationColumn,
      tableOptions.operationColumnText,
      tableOptions.operationColumnWidth,
    ]);

    const densityMenuItems = (Object.keys(densityConfig) as DensityType[]).map(
      (key) => ({
        key,
        label: densityConfig[key].label,
      }),
    );

    const handleDensityChange = ({ key }: { key: string }) => {
      const nextDensity = key as DensityType;
      setDensity(nextDensity);
      persistPreferences(nextDensity, columnVisibility);
    };

    const handleColumnVisibilityChange = (columnKey: string, checked: boolean) => {
      const nextVisibility = {
        ...columnVisibility,
        [columnKey]: checked,
      };
      setColumnVisibility(nextVisibility);
      persistPreferences(density, nextVisibility);
    };

    const resetTablePreferences = () => {
      setDensity("default");
      setColumnVisibility({});
      persistPreferences("default", {});
    };

    const columnSettingContent = (
      <div className="w-[220px]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">列设置</span>
          <Button type="link" size="small" onClick={resetTablePreferences}>
            恢复默认
          </Button>
        </div>
        <Space direction="vertical" size={8} className="w-full">
          {baseColumns.map((column) => (
            <Checkbox
              key={column.columnKey}
              checked={columnVisibility[column.columnKey] !== false}
              onChange={(event) =>
                handleColumnVisibilityChange(column.columnKey, event.target.checked)
              }
            >
              {column.title}
            </Checkbox>
          ))}
        </Space>
      </div>
    );

    const rowSelection: TableProps<any>['rowSelection'] = {
      selectedRowKeys,
      onChange: (keys: React.Key[], rows: any[]) => {
        setSelectedRowKeys(keys);
        setSelectedRows(rows);
      },
    };

    return (
      <>
        <style>
          {`
            .nest-table-compact .ant-table-thead > tr > th,
            .nest-table-compact .ant-table-tbody > tr > td {
              padding-top: 8px !important;
              padding-bottom: 8px !important;
            }
          `}
        </style>

        <Row>
          <Form
            form={form}
            layout="inline"
            className="w-full"
            name="basic"
            onFinish={onFinish}
            initialValues={searchForm}
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "100%",
              rowGap: 16,
            }}
          >
            {visibleFields}

            <Col style={{ marginLeft: "auto" }}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button onClick={onReset}>重置</Button>
                  {needCollapse && (
                    <Button
                      type="link"
                      onClick={() => setExpanded(!expanded)}
                      icon={expanded ? <UpOutlined /> : <DownOutlined />}
                    >
                      {expanded ? "收起" : "展开"}
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Form>
        </Row>

        <Divider />

        <div className="flex items-center justify-between">
          <Space>
            {tableOptions.add?.show && hasAuth(tableOptions.add.auth) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={tableOptions.add.func}
              >
                {tableOptions.add.text}
              </Button>
            )}
            {tableOptions.delete?.show &&
              tableOptions.delete.batch &&
              hasAuth(tableOptions.delete.auth) && (
                <Button danger type="primary" icon={<DeleteOutlined />}>
                  {tableOptions.delete.text}
                </Button>
              )}
            {tableOptions.import?.show && hasAuth(tableOptions.import.auth) && (
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => importRef.current?.open()}
              >
                {tableOptions.import.text}
              </Button>
            )}
            {BeforeHeaderExtend}
          </Space>

          <Space size={4}>
            <Tooltip title="刷新">
              <Button
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={refresh}
                loading={loading}
              />
            </Tooltip>

            <Dropdown
              menu={{
                items: densityMenuItems,
                onClick: handleDensityChange,
                selectable: true,
                selectedKeys: [density],
              }}
              trigger={["click"]}
            >
              <Tooltip title="密度">
                <Button shape="circle" icon={<ColumnHeightOutlined />} />
              </Tooltip>
            </Dropdown>

            {Array.isArray(columns) && baseColumns.length > 0 && (
              <Popover
                content={columnSettingContent}
                trigger="click"
                placement="bottomRight"
                open={columnSettingOpen}
                onOpenChange={setColumnSettingOpen}
              >
                <Tooltip title="列设置">
                  <Button shape="circle" icon={<SettingOutlined />} />
                </Tooltip>
              </Popover>
            )}
          </Space>
        </div>

        <div className="mt-[10px]">
          <Table
            className={densityConfig[density].className}
            size={densityConfig[density].size}
            rowKey={rowKey}
            scroll={{ x: "max-content" }}
            dataSource={tableData.data}
            loading={loading}
            onChange={handleTableChange}
            columns={normalizedColumns}
            rowSelection={{ type: 'checkbox', ...rowSelection }}
            pagination={
              tableData.total
                ? {
                    position: ["bottomRight"],
                    total: tableData.total,
                    current: requestParams.page,
                    pageSize: requestParams.limit,
                  }
                : { position: ["none"] }
            }
          >
            {!Array.isArray(columns) ? columns : null}
          </Table>
        </div>

        <NestImport
          ref={importRef}
          importOptions={tableOptions.import ?? {}}
          onSuccess={refresh}
        />
      </>
    );
  },
);

export default NestTable;
