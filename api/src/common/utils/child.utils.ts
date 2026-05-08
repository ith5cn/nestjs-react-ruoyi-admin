export const listToTree = (list: any[]) => {
    const map = new Map();
    list.forEach((item: any) => map.set(item.id, item));
    const tree: any[] = [];
    list.forEach((item: any) => {
        const parent = map.get(item.parentId);
        if (parent) {
            parent.children = parent.children || [];
            parent.children.push(item);
        } else {
            tree.push(item);
        }
    });
    return tree;
}