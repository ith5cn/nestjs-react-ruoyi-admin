import { Select } from "antd";
import { useEffect, useState } from "react";
import { accessPostApi } from "@/api/system/post";

const PostSelect = ({ value, onChange }: { value?: number[], onChange?: (value: number[]) => void }) => {
    const [postData, setPostData] = useState([]);
    useEffect(() => {
        accessPostApi().then((res: any) => {
            if (res.code === 0 && res.data) {
                setPostData(res.data.map((item: any) => ({ label: item.name, value: item.id })));
            }
        });
    }, []);
    const handleChange = (value: number[]) => {
        onChange?.(value);
    };
    return (
        <Select options={postData} value={value} onChange={handleChange} allowClear placeholder="请选择岗位" />
    );
};

export default PostSelect;