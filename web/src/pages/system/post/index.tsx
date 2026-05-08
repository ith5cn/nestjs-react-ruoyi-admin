import { useRef } from "react";
import { Col, Form, Input } from "antd";
import NestTable, { type TableRef, type ColumnDef } from "@/components/nest-table";
import NestSelect from "@/components/nest-select";
import { postDeleteApi, postListApi } from "@/api/system/post";
import { message } from "antd";
import moment from "moment";
import PostEdit, { type PostEditRef } from "./edit";

const PostIndex = () => {
    const editRef = useRef<PostEditRef>(null);
    const tableRef = useRef<TableRef>(null);

    return (
        <>
            <NestTable
                ref={tableRef}
                searchFields={
                    <>
                        <Col span={6}>
                            <Form.Item name="name" label="岗位名称">
                                <Input placeholder="请输入岗位名称" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="code" label="岗位编码">
                                <Input placeholder="请输入岗位编码" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="status" label="状态">
                                <NestSelect dict="status" placeholder="请选择状态" />
                            </Form.Item>
                        </Col>
                    </>
                }
                options={{
                    api: postListApi,
                    add: {
                        show: true,
                        auth: ['/system/post/create'],
                        func: () => editRef.current?.open('add'),
                    },
                    edit: {
                        show: true,
                        auth: ['/system/post/update'],
                        func: (record: any) => editRef.current?.open('edit', record),
                    },
                    delete: {
                        show: true,
                        auth: ['/system/post/destroy'],
                        func: async (record: any) => {
                            const res = await postDeleteApi(record.id);
                            if (res.code === 0) {
                                message.success("删除成功");
                                tableRef.current?.refresh();
                            }
                        },
                    },
                }}
                columns={[
                    { title: '岗位名称', dataIndex: 'name', width: 200 },
                    { title: '岗位编码', dataIndex: 'code', width: 150 },
                    { title: '排序', dataIndex: 'sort', width: 80 },
                    { title: '状态', dataIndex: 'status', width: 100, type: 'dict', dict: 'status' },
                    { title: '创建时间', dataIndex: 'createTime', width: 180, render: (text: string) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
                ] as ColumnDef[]}
            />
            <PostEdit
                ref={editRef}
                onSuccess={() => tableRef.current?.refresh()}
            />
        </>
    );
};

export default PostIndex;
