import request from "@/utils/request";

export interface RegionOption {
  label: string;
  value: string;
  children?: RegionOption[];
}

export const regionOptionsApi = () => {
  return request.get<RegionOption[]>("/system/region/options");
};
