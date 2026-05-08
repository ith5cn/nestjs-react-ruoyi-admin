import { Form, Input, message, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import { forwardRef, useImperativeHandle, useState } from "react";
import NestSelect from "../nest-select";
import { userUpdateApi } from "@/api/system/user";

interface NestDictModalProps {
    onSuccess: () => void
}

export interface NestDictModalRef {
    open: (title:string, data?: Record<string, any>) => void;
    setFormData: (data: Record<string, any>) => void;
}

export interface ModalFormData {
    id:number
    backendSetting:string
}

const NestDictModal = forwardRef<NestDictModalRef, NestDictModalProps>(({onSuccess}, ref) => {
    const [visible, setVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [form] = useForm()

    const open = (title:string, data?: Record<string, any>)=>{
        setModalTitle(title)
       
        form.resetFields();
        form.setFieldsValue(data)
        setVisible(true)
    }

    const setFormData = (data: Record<string, any>) => {
        form.setFieldsValue(data)
    }

    const close = () => {
        setVisible(false)
    }

    const handleSubmit = async ()=>{
        try {
                setLoading(true);
                const values = await form.validateFields();
           
                await userUpdateApi(values.id, values);
                message.success('操作成功');
                onSuccess?.();
                close();
        } catch (error: any) {
            // 如果是校验错误则忽略，API 错误由 request 拦截器处理
            if (error?.errorFields) return;
        } finally {
            setLoading(false);
        }
    }

    useImperativeHandle(ref, () => ({
        open,
        setFormData
    }))

    return (
        <Modal title={modalTitle} loading={loading} open={visible} onCancel={() => setVisible(false)} onOk={()=>{ handleSubmit()}}>
            <Form form={form}>
                <Form.Item hidden name="id">
                    <Input />
                </Form.Item>
                <Form.Item label={modalTitle} name="backendSetting">
                    <NestSelect dict="dashboard" />
                </Form.Item>
            </Form>
        </Modal>
    )
})


export default NestDictModal;