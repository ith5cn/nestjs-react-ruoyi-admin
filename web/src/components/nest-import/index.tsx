import { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Upload, Typography, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import request from '@/utils/request';

const { Dragger } = Upload;
const { Link } = Typography;

export interface NestImportProps {
    /** import 配置，对应 defaultOptions.import */
    importOptions: {
        url?: string;
        params?: Record<string, any>;
        templateUrl?: string;
    };
    /** 导入成功回调 */
    onSuccess?: () => void;
}

export interface NestImportRef {
    open: () => void;
    close: () => void;
}

const NestImport = forwardRef<NestImportRef, NestImportProps>(
    ({ importOptions, onSuccess }, ref) => {
        const [visible, setVisible] = useState(false);

        const open = () => setVisible(true);
        const close = () => setVisible(false);

        useImperativeHandle(ref, () => ({ open, close }));

        /** 自定义上传 */
        const customRequest: UploadProps['customRequest'] = async (options) => {
            const { file } = options;
            message.info('文件上传导入中...');

            const formData = new FormData();
            formData.append('file', file as File);

            // 附加额外参数
            if (importOptions.params) {
                Object.keys(importOptions.params).forEach((key) => {
                    formData.append(key, importOptions.params![key]);
                });
            }

            try {
                const res = await request.uploadFile(importOptions.url!, formData);
                if (res.code === 200) {
                    message.success(res.message || '导入成功');
                }
                onSuccess?.();
                close();
            } catch {
                // 错误已由 request 拦截器统一处理
            }
        };

        /** 下载模板 */
        const handleDownloadTemplate = async () => {
            const url = importOptions.templateUrl;
            if (!url) return;

            message.info('请求服务器下载文件中...');

            if (/^(http|https):\/\//.test(url)) {
                window.open(url);
            } else {
                try {
                    const blob = await request.downloadFile(url);
                    // 从 URL 中提取文件名
                    const fileName = url.split('/').pop() || 'template.xlsx';
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                    message.success('请求成功，文件开始下载');
                } catch {
                    // 错误已由 request 拦截器统一处理
                }
            }
        };

        return (
            <Modal
                title="导入"
                open={visible}
                onCancel={close}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Dragger
                    accept=".xlsx,.xls"
                    showUploadList={false}
                    customRequest={customRequest}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text" style={{ color: '#e53e3e', fontWeight: 'bold' }}>
                        导入Excel
                    </p>
                    <p className="ant-upload-hint">
                        将文件拖到此处，或<span style={{ color: '#3370ff' }}>点击上传</span>，只能上传
                        xls/xlsx 文件
                    </p>
                </Dragger>

                <div style={{ marginTop: 20, textAlign: 'right', fontStyle: 'italic' }}>
                    <Link onClick={handleDownloadTemplate}>下载Excel模板</Link>
                </div>
            </Modal>
        );
    },
);

export default NestImport;
