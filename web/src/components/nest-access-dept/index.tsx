import { accessDeptApi } from "@/api/system/dept";
import { Button, Input, Space, Tree } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import type { Key } from "react";

const getParentKey = (key: Key, tree: any[]): Key | undefined => {
    let parentKey: Key | undefined;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children && node.children.length > 0) {
            if (node.children.some((item: any) => item.key === key)) {
                parentKey = node.key;
            } else {
                const found = getParentKey(key, node.children);
                if (found) {
                    parentKey = found;
                }
            }
        }
    }
    return parentKey;
};

interface NestAccessDeptProps {
    onSelect?: (deptId: Key | undefined) => void;
}

const NestAccessDept: React.FC<NestAccessDeptProps> = ({ onSelect }) => {
    const [deptTree, setDeptTree] = useState<any[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [allKeys, setAllKeys] = useState<Key[]>([]);
    const [dataList, setDataList] = useState<{ key: Key; title: string }[]>([]);
    const [isExpandAll, setIsExpandAll] = useState(true);

    useEffect(() => {
        const fetchDeptTree = async () => {
            try {
                const res = await accessDeptApi({ tree: true });
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
                    setDeptTree(formattedTree);
                    setAllKeys(keys);
                    setDataList(list);
                    setExpandedKeys(keys);
                }
            } catch (err) {
                console.error("Failed to fetch department tree", err);
            }
        };
        fetchDeptTree();
    }, []);

    const onExpand = (newExpandedKeys: Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (!value) {
            setSearchValue("");
            setExpandedKeys(isExpandAll ? allKeys : []);
            setAutoExpandParent(false);
            return;
        }

        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title && item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, deptTree);
                }
                return null;
            })
            .filter((item, i, self) => !!(item && self.indexOf(item) === i));

        setExpandedKeys(newExpandedKeys as Key[]);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    const toggleExpandAll = () => {
        // Toggle the state and update expandedKeys
        const newIsExpandAll = !isExpandAll;
        setIsExpandAll(newIsExpandAll);
        if (newIsExpandAll) {
            setExpandedKeys(allKeys);
        } else {
            setExpandedKeys([]);
        }
        setAutoExpandParent(false);
    };

    const handleSelect = (selectedKeys: Key[]) => {
        if (onSelect) {
            onSelect(selectedKeys.length > 0 ? selectedKeys[0] : undefined);
        }
    };

    const treeData = useMemo(() => {
        if (!deptTree || deptTree.length === 0) return [];

        const loop = (data: any[]): any[] =>
            data.map((item) => {
                const strTitle = item.title ? String(item.title) : "";
                let titleNode: React.ReactNode = <span>{strTitle}</span>;

                if (searchValue && strTitle.includes(searchValue)) {
                    const index = strTitle.indexOf(searchValue);
                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchValue.length);

                    titleNode = (
                        <span>
                            {beforeStr}
                            <span className="text-blue-500 bg-blue-50">{searchValue}</span>
                            {afterStr}
                        </span>
                    );
                }

                if (item.children) {
                    return { ...item, title: titleNode, children: loop(item.children) };
                }
                return { ...item, title: titleNode };
            });

        return loop(deptTree);
    }, [deptTree, searchValue]);

    return (
        <div className="w-[250px] border border-gray-200 p-2">
            <Space.Compact className="w-full mb-3">
                <Input
                    placeholder="请输入部门名称"
                    allowClear
                    onChange={onChange}
                    value={searchValue}
                />
                <Button type="default" onClick={toggleExpandAll}>
                    {isExpandAll ? "收起" : "展开"}
                </Button>
            </Space.Compact>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {treeData.length > 0 ? (
                    <Tree
                        onExpand={(keys) => onExpand(keys as Key[])}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onSelect={handleSelect}
                        treeData={treeData}
                    />
                ) : (
                    <div className="text-center text-gray-400 py-4">暂无数据</div>
                )}
            </div>
        </div>
    );
};

export default NestAccessDept;
