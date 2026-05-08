import request from "@/utils/request";

export const operLogListApi = (params?: any) => request.get("/system/oper-log/index", { params });
export const operLogCreateApi = (data: any) => request.post("/system/oper-log", data);
export const operLogUpdateApi = (id: string | number, data: any) => request.put(`/system/oper-log/${id}`, data);
export const operLogDeleteApi = (id: string | number) => request.delete(`/system/oper-log/${id}`);
