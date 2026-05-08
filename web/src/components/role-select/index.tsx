import { Select } from "antd";
import { useEffect, useState } from "react";
import { roleAccessApi } from "@/api/system/role";

interface RoleSelectProps {
    value?: number[];
    onChange?: (value: number[]) => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ value, onChange }) => {
    const [roleData, setRoleData] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        roleAccessApi().then((res: any) => {
            if (res.code === 0 && res.data) {
                setRoleData(res.data.map((item: any) => ({ label: item.name, value: item.id })));
            }
        });
    }, []);

    const handleChange = (val: number[]) => {
        console.log(`selected ${val}`);
        onChange?.(val);
    };

    return (
        <Select
            value={value}
            placeholder="请选择角色"
            onChange={handleChange}
            mode="multiple"
            allowClear
            options={roleData}
        />
    );
};

export default RoleSelect;