import request from "@/utils/request";

// ============== 字典类型 API ==============

export const dictTypeListApi = (params: any) => {
    return request.get('/system/dict-type/index', { params })
}

export const dictTypeCreateApi = (data: any) => {
    return request.post('/system/dict-type', data)
}

export const dictTypeUpdateApi = (id: string | number, data: any) => {
    return request.put(`/system/dict-type/${id}`, data)
}

export const dictTypeDeleteApi = (id: string | number) => {
    return request.delete(`/system/dict-type/${id}`)
}


export const dictAllApi = () => {
    return request.get<Record<string, any[]>>('/system/dict-data/dictAll')
}

// ============== 字典数据 API ==============

export const dictDataListApi = (params: any) => {
    return request.get('/system/dict-data/index', { params })
}

export const dictDataCreateApi = (data: any) => {
    return request.post('/system/dict-data', data)
}

export const dictDataUpdateApi = (id: string | number, data: any) => {
    return request.put(`/system/dict-data/${id}`, data)
}

export const dictDataDeleteApi = (id: string | number) => {
    return request.delete(`/system/dict-data/${id}`)
}
