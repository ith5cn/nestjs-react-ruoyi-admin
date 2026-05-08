export const INTERNAL_TASKS = [
    {
        name: '同步客户信息',
        target: 'CustomerCrontabTaskService.syncCustomerInfo',
        remark: '从腾讯云拉取客户基础信息，并更新本地客户表。',
        parameterExample: null,
    },
    {
        name: '同步客户额度',
        target: 'CreditCrontabTaskService.syncCustomerCredit',
        remark: '从腾讯云拉取客户额度与余额，并更新本地客户额度字段。',
        parameterExample: null,
    },
    {
        name: '同步每日账单',
        target: 'CostCrontabTaskService.syncDailyBill',
        remark: '拉取客户日账单并写入日消耗表；不传参数时默认同步昨天。',
        parameterExample: {
            date: '2026-04-07',
        },
    },
] as const;
