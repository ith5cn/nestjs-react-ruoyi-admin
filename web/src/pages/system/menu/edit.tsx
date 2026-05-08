import { forwardRef, useImperativeHandle, useState, useMemo } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  TreeSelect,
  message,
  Button,
  Space,
  AutoComplete,
} from "antd";
import {
  menuListApi,
  menuCreateApi,
  menuUpdateApi,
  type MenuFormData,
} from "@/api/system/menu";
import IconPicker from "@/components/icon-picker";

const { TextArea } = Input;

const modules = import.meta.glob("/src/pages/**/*.tsx");
const allComponents = Object.keys(modules).map((item) => ({
  value: item.replace("/src/pages/", "").replace(".tsx", ""),
}));

// 菜单类型选项
const menuTypeOptions = [
  { label: "菜单", value: "M" },
  { label: "按钮", value: "B" },
  { label: "链接", value: "L" },
  { label: "iFrame", value: "I" },
];

// 是/否选项
const yesOrNoOptions = [
  { label: "是", value: 1 },
  { label: "否", value: 2 },
];

// 状态选项
const statusOptions = [
  { label: "正常", value: 1 },
  { label: "停用", value: 2 },
];

// 表单初始值
const initialFormData: MenuFormData = {
  parentId: null,
  name: "",
  type: "M",
  icon: "",
  code: "",
  route: "",
  component: "",
  sort: 100,
  isHidden: 2,
  isLayout: 1,
  status: 1,
  remark: "",
};

export interface MenuEditRef {
  open: (type?: "add" | "edit") => void;
  setFormData: (data: Record<string, any>) => void;
}

interface MenuEditProps {
  onSuccess?: () => void;
}

const MenuEdit = forwardRef<MenuEditRef, MenuEditProps>(
  ({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [menuData, setMenuData] = useState<any[]>([]);
    const [componentSearch, setComponentSearch] = useState("");
    const [form] = Form.useForm();

    const componentList = useMemo(() => {
      if (!componentSearch) return allComponents.slice(0, 50);
      return allComponents
        .filter((item) =>
          item.value.toLowerCase().includes(componentSearch.toLowerCase()),
        )
        .slice(0, 50);
    }, [componentSearch]);

    const title = "菜单管理" + (mode === "add" ? " - 新增" : " - 编辑");

    // 获取菜单树数据
    const initPage = async () => {
      try {
        const resp = await menuListApi({});
        if (resp.data?.data) {
          setMenuData(resp.data.data);
        } else {
          setMenuData(resp.data || []);
        }
      } catch {
        setMenuData([]);
      }
    };

    // 打开弹框
    const open = async (type: "add" | "edit" = "add") => {
      setMode(type);
      form.resetFields();
      form.setFieldsValue({ ...initialFormData });
      setVisible(true);
      await initPage();
    };

    // 设置表单数据（编辑时使用）
    const setFormData = (data: Record<string, any>) => {
      form.setFieldsValue(data);
    };

    // 关闭弹框
    const close = () => {
      setVisible(false);
    };

    // 提交表单
    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        setLoading(true);
        if (mode === "add") {
          await menuCreateApi(values);
        } else {
          await menuUpdateApi(values.id, values);
        }
        message.success("操作成功");
        onSuccess?.();
        close();
      } catch (error: any) {
        // 如果是校验错误则忽略，API 错误由 request 拦截器处理
        if (error?.errorFields) return;
      } finally {
        setLoading(false);
      }
    };

    // 暴露给父组件的方法（等同于 Vue 的 defineExpose）
    useImperativeHandle(ref, () => ({
      open,
      setFormData,
    }));

    // 监听菜单类型变化
    const menuType = Form.useWatch("type", form);

    return (
      <Drawer
        title={title}
        open={visible}
        width={600}
        closable={false}
        maskClosable={false}
        onClose={close}
        extra={
          <Space>
            <Button onClick={close}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              确定
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" initialValues={initialFormData}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="上级菜单" name="parentId">
            <TreeSelect
              treeData={menuData}
              fieldNames={{ label: "name", value: "id", children: "children" }}
              allowClear
              placeholder="请选择上级菜单"
            />
          </Form.Item>

          <Form.Item
            label="菜单名称"
            name="name"
            rules={[{ required: true, message: "菜单名称不能为空" }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item
            label="菜单类型"
            name="type"
            rules={[{ required: true, message: "请选择菜单类型" }]}
          >
            <Radio.Group
              options={menuTypeOptions}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          {menuType !== "B" && (
            <Form.Item label="图标" name="icon">
              <IconPicker placeholder="请选择图标" />
            </Form.Item>
          )}

          <Form.Item
            label={menuType === "B" ? "接口地址" : "菜单标识"}
            name="code"
            rules={[{ required: true, message: "菜单标识不能为空" }]}
          >
            <Input placeholder="请输入内容" />
          </Form.Item>

          {menuType !== "B" && (
            <Form.Item label="路由地址" name="route">
              <Input placeholder="请输入路由地址" />
            </Form.Item>
          )}

          {menuType === "M" && (
            <Form.Item label="组件地址" name="component">
              <AutoComplete
                options={componentList}
                onSearch={setComponentSearch}
                allowClear
                placeholder="请输入组件地址"
              />
            </Form.Item>
          )}

          <Form.Item
            label="排序数字"
            name="sort"
            rules={[{ required: true, message: "排序数字不能为空" }]}
          >
            <InputNumber
              placeholder="请输入排序数字"
              style={{ width: "100%" }}
            />
          </Form.Item>

          {menuType !== "B" && (
            <Form.Item label="是否隐藏" name="isHidden">
              <Radio.Group
                options={yesOrNoOptions}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          )}

          {menuType !== "B" && (
            <Form.Item label="继承Layout" name="isLayout">
              <Radio.Group
                options={yesOrNoOptions}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          )}

          <Form.Item label="状态" name="status">
            <Radio.Group
              options={statusOptions}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Drawer>
    );
  },
);

MenuEdit.displayName = "MenuEdit";

export default MenuEdit;
