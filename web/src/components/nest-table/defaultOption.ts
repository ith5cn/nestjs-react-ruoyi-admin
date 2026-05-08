export default {
    // 当前crud组件的 id，全局唯一，不指定则随机生成一个
    id: undefined,
    // 请求api方法
    api: () => { },
    // 每页数量
    pageSize: 10,
    add: {
        // 新增api
        func: undefined,
        // 显示新增按钮的权限
        auth: [],
        // 按钮文案
        text: '新增',
        // 是否显示
        show: false
    },
    edit: {
        // 编辑api
        func: undefined,
        // 显示编辑按钮的权限
        auth: [],
        // 按钮文案
        text: '编辑',
        // 是否显示
        show: false
    },
    delete: {
        // 删除api
        func: undefined,
        // 显示删除按钮的权限
        auth: [],
        // 按钮文案
        text: '删除',
        // 删除确认弹窗文案
        confirmText: '确定要删除该数据吗？',
        // 是否显示
        show: false,
        // 是否显示批量处理按钮
        batch: false
    },
    import: {
        // 导入url
        url: undefined,
        // 导入参数
        params: {},
        // 下载模板地址
        templateUrl: undefined,
        // 显示导入按钮的权限
        auth: [],
        // 按钮文案
        text: '导入',
        // 是否显示
        show: false
    },
    // 是否显示操作列
    operationColumn: true,
    // 操作列宽度
    operationColumnWidth: 130,
    // 操作列名称
    operationColumnText: '操作'
}