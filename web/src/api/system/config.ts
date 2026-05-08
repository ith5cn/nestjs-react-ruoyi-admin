import request from "@/utils/request";

export const getConfigGroupListApi = (params?: any) => {
  return request.get("/system/config-group/index", { params });
};

export const configGroupCreateApi = (data: any) => {
  return request.post("/system/config-group", data);
};

export const configGroupUpdateApi = (id: number | string, data: any) => {
  return request.put(`/system/config-group/${id}`, data);
};

export const configGroupDeleteApi = (id: number | string) => {
  return request.delete(`/system/config-group/${id}`);
};

export const getConfigListApi = (params?: any) => {
  return request.get("/system/config/index", { params });
};

export const configCreateApi = (data: any) => {
  return request.post("/system/config", data);
};

export const configUpdateApi = (id: number | string, data: any) => {
  return request.put(`/system/config/${id}`, data);
};

export const configDeleteApi = (id: number | string) => {
  return request.delete(`/system/config/${id}`);
};

export const configBatchUpdateApi = (data: { group_id: number; config: any[] }) => {
  return request.post("/system/config/batch-update", data);
};

export const getConfigInfoApi = (code: string) => {
  return request.get("/system/config/get-config-info", { params: { code } });
};