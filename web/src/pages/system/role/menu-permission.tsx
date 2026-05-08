import { forwardRef, useImperativeHandle, useState } from "react";
import { Descriptions, message, Modal, Tree } from "antd";
import { menuAccessApi, menuByRoleApi } from "@/api/system/menu";
import { roleBindMenuApi } from "@/api/system/role";

export interface MenuPermissionRef {
    open: (record: Record<string, any>) => void;
}

interface MenuPermissionProps {
    onSuccess?: () => void;
}

const MenuPermission = forwardRef<MenuPermissionRef, MenuPermissionProps>(({ onSuccess }, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [roleInfo, setRoleInfo] = useState<Record<string, any>>({});
    const [menuTree, setMenuTree] = useState<any[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
    const [halfCheckedKeys, setHalfCheckedKeys] = useState<number[]>([]);

    // 递归获取所有叶子节点 ID
    const getLeafKeys = (treeData: any[]) => {
        const leafKeys: number[] = [];
        const dfs = (nodes: any[]) => {
            for (const node of nodes) {
                if (!node.children || node.children.length === 0) {
                    leafKeys.push(node.id);
                } else {
                    dfs(node.children);
                }
            }
        };
        dfs(treeData);
        return leafKeys;
    };

    const open = async (record: Record<string, any>) => {
        setRoleInfo(record);
        setVisible(true);
        setLoading(true);
        try {
            // 并行获取菜单树和角色已有菜单
            const [menuRes, roleMenuRes] = await Promise.all([
                menuAccessApi(),
                menuByRoleApi(record.id),
            ]);

            const treeData = menuRes.data?.data || menuRes.data || [];
            const roleMenuIds: number[] = roleMenuRes.data?.data || roleMenuRes.data || [];

            setMenuTree(treeData);

            // 提取出所有叶子节点
            const leafKeys = getLeafKeys(treeData);
            
            // 为了防止父节点包含导致子节点全部被勾选，回显时只赋值叶子节点。
            // 选中的叶子节点：
            const leafCheckedKeys = roleMenuIds.filter((id: number) => leafKeys.includes(id));
            // 半选或全选的父节点：
            const parentKeys = roleMenuIds.filter((id: number) => !leafKeys.includes(id));

            setCheckedKeys(leafCheckedKeys);
            setHalfCheckedKeys(parentKeys);
        } catch {
            setMenuTree([]);
            setCheckedKeys([]);
            setHalfCheckedKeys([]);
        } finally {
            setLoading(false);
        }
    };

    const close = () => {
        setVisible(false);
        setMenuTree([]);
        setCheckedKeys([]);
        setHalfCheckedKeys([]);
    };

    const handleCheck = (checked: any, info: any) => {
        if (Array.isArray(checked)) {
            setCheckedKeys(checked as number[]);
        } else {
            setCheckedKeys(checked.checked as number[]);
        }
        setHalfCheckedKeys((info.halfCheckedKeys || []) as number[]);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            // 提交时，将全选节点(checkedKeys)与半选节点(halfCheckedKeys)去重合并一并传给后台
            const finalIds = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]));
            
            await roleBindMenuApi(roleInfo.id, { ids: finalIds });
            message.success("菜单权限设置成功");
            onSuccess?.();
            close();
        } catch {
            // error handled by request interceptor
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        open,
    }));

    return (
        <Modal
            open={visible}
            title="菜单权限"
            confirmLoading={loading}
            width={600}
            onOk={handleSubmit}
            onCancel={close}
        >
            <Descriptions column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="角色名称">{roleInfo.name}</Descriptions.Item>
                <Descriptions.Item label="角色标识">{roleInfo.code}</Descriptions.Item>
            </Descriptions>
            <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 6, padding: 8 }}>
                <Tree
                    checkable
                    defaultExpandAll
                    checkedKeys={checkedKeys}
                    onCheck={handleCheck}
                    treeData={menuTree}
                    fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                />
            </div>
        </Modal>
    );
});

MenuPermission.displayName = 'MenuPermission';

export default MenuPermission;
