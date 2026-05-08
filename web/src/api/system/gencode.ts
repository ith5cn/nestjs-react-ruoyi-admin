import request from "@/utils/request";

export const genCodeListApi = (params: any) => {
  return request.get("/system/codegen/index", { params });
};

export const getDatasourcesApi = () => {
  return request.get("/system/codegen/datasources");
};

export const getDbTablesBySourceApi = (params: Record<string, any>) => {
  return request.get("/system/codegen/db-tables", { params });
};

export const importTablesApi = (data: any) => {
  return request.post("/system/codegen/importTables", data);
};

export const deleteApi = (data: { ids: number[] }) => {
  return request.post("/system/codegen/delete", data);
};

export const genCodeDetailApi = (id: number | string) => {
  return request.get(`/system/codegen/detail/${id}`);
};

export const genCodeUpdateApi = (id: number | string, data: any) => {
  return request.put(`/system/codegen/${id}`, data);
};

export const genCodeGenerateApi = (id: number | string) => {
  return request.post(`/system/codegen/generate/${id}`);
};

export const genCodePreviewApi = (id: number | string) => {
  return request.get(`/system/codegen/preview/${id}`);
};
