import type { FormInstance } from "antd";
import { Alert, Col, Divider, Form, Input, InputNumber, Radio, Row, TreeSelect } from "antd";

interface GencodeSettingProps {
  form: FormInstance;
  menuTree: any[];
}

const GencodeSetting = ({ form, menuTree }: GencodeSettingProps) => {
  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="cityLinkage 默认生成 string[]；wangEditor 默认生成 HTML 字符串，请确认业务字段支持 JSON 或富文本内容存储"
      />
      <Divider titlePlacement="start" plain>
        基础信息
      </Divider>
      <Form form={form} layout="horizontal" labelCol={{ span: 4 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="表名称" name="table_name">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="表描述" name="table_comment" rules={[{ required: true, message: "请输入表描述" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="实体类" name="class_name" rules={[{ required: true, message: "请输入实体类" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="业务名称" name="business_name" rules={[{ required: true, message: "请输入业务名称" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="备注信息" name="remark">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" plain>
          生成信息
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="包名" name="package_name" rules={[{ required: true, message: "请输入包名" }]}>
              <Input placeholder="请输入包名，如 system" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="生成路径" name="generate_path" rules={[{ required: true, message: "请输入生成路径" }]}>
              <Input placeholder="请输入前端项目目录，如 sdm.ith5.com" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="模型类型" name="generate_model">
              <Radio.Group>
                <Radio value={1}>软删除</Radio>
                <Radio value={2}>非软删除</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="所属菜单" name="belong_menu_id">
              <TreeSelect
                treeData={menuTree}
                allowClear
                placeholder="请选择所属菜单"
                fieldNames={{ label: "name", value: "id", children: "children" }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="菜单名称" name="menu_name" rules={[{ required: true, message: "请输入菜单名称" }]}>
              <Input placeholder="请输入菜单名称" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="表单样式" name="component_type">
              <Radio.Group optionType="button">
                <Radio value={1}>模态框</Radio>
                <Radio value={2}>抽屉</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="表单宽度" name="form_width">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="表单全屏" name="is_full">
              <Radio.Group>
                <Radio value={1}>是</Radio>
                <Radio value={2}>否</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default GencodeSetting;
