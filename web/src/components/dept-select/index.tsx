import { TreeSelect } from "antd";


import { accessDeptApi } from "@/api/system/dept";
import { useEffect, useState, type Key } from "react";

const DeptSelect = ({ value, onChange }: { value?: Key, onChange?: (value: Key) => void }) => {
    const [treeData, setTreeData] = useState<any[]>([]);
    useEffect(() => {
        accessDeptApi({ tree: true }).then((res) => {
            if (res.code === 0 && res.data) {
                const keys: Key[] = [];
                const list: { key: Key; title: string }[] = [];

                const formatTreeData = (listData: any[]): any[] => {
                    if (!listData || !Array.isArray(listData)) return [];
                    return listData.map((item) => {
                        keys.push(item.id);
                        const title = item.name || "";
                        list.push({ key: item.id, title });
                        return {
                            title,
                            key: item.id,
                            value: item.id,
                            // 如果 children 是空数组，我们传入 undefined 避免树组件渲染空折叠图标
                            children: item.children && item.children.length > 0 ? formatTreeData(item.children) : undefined,
                        };
                    });
                };

                const formattedTree = formatTreeData(res.data);
                setTreeData(formattedTree);
            }
        });
    }, []);
    const handleChange = (value: Key) => {
        onChange?.(value);
    };
    return <TreeSelect treeData={treeData} value={value} onChange={handleChange} />;
};

export default DeptSelect;