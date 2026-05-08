import request from "@/utils/request";

export const noticeListApi = (params?: any) => request.get("/system/notice/index", { params });
export const noticeCreateApi = (data: any) => request.post("/system/notice", data);
export const noticeUpdateApi = (id: string | number, data: any) => request.put(`/system/notice/${id}`, data);
export const noticeDeleteApi = (id: string | number) => request.delete(`/system/notice/${id}`);
