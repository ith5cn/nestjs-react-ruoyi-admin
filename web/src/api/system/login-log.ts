import request from "@/utils/request";

export const loginLogListApi = (params?: any) => request.get("/system/login-log/index", { params });
export const loginLogCreateApi = (data: any) => request.post("/system/login-log", data);
export const loginLogUpdateApi = (id: string | number, data: any) => request.put(`/system/login-log/${id}`, data);
export const loginLogDeleteApi = (id: string | number) => request.delete(`/system/login-log/${id}`);
