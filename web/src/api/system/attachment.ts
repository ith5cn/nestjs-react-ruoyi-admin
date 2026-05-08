import request from "@/utils/request";

export const attachmentListApi = (params?: any) => request.get("/system/attachment/index", { params });
export const attachmentDeleteApi = (data: { ids: Array<number | string>; removeSource?: boolean }) =>
  request.post("/system/attachment/delete", data);
