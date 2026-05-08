import request from "@/utils/request";


/**
 * 数据列表
 */
export const getPageList = (params = {}) => {
    return request.get('/tcl/customer/index', { params });
}

/**
 * 更新数据
 */
export const update = (id: number, data = {}) => {
    return request.put('/tcl/customer/' + id, data)
}


/**
 * 充值
 */
export const recharge = (data = {}) => {
    return request.post('/tcl/customer/recharge', data)
}


/**
 * 同步余额
 */
export const syncRemainingCredit = (params = {}) => {
    return request.get('/tcl/customer/queryCreditByUinList', { params })
}

/**
 * 每日客户账号消耗
 */
export const customerConsumeResport = async (params: any = {}) => {
    // date 是 dayjs 对象，需要格式化
    const formatted = { ...params };
    if (params.date && params.date.format) {
        formatted.date = params.consumeType === 'year'
            ? params.date.format('YYYY')
            : params.date.format('YYYY-MM');
    }
    return request.get('/tcl/customer/customerConsumeResport', { params: formatted });
}

/**
 * 修改备注
 */
export const updateRemark = (data: { clientUin: number; remark: string }) => {
    return request.post('/tcl/customer/updateRemark', data);
}

/**
 * 同步二代客户账号
 */
export const syncCustomerUin = () => {
    return request.post('/tcl/customer/syncCustomerUin');
}

/**
 * 添加归属
 */
export const addAuthId = (data: { clientUin: number; authId: number }) => {
    return request.post('/tcl/customer/addAuthId', data);
}