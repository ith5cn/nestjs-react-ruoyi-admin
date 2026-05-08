import { Cascader } from "antd";
import type { CascaderProps } from "antd";
import { useEffect, useState } from "react";
import { regionOptionsApi, type RegionOption } from "@/api/system/region";

interface CityLinkageProps extends Omit<CascaderProps, "options" | "multiple"> {}

let cachedOptions: RegionOption[] | null = null;
let cachedPromise: Promise<RegionOption[]> | null = null;

const fetchRegionOptions = async () => {
  if (cachedOptions) return cachedOptions;
  if (!cachedPromise) {
    cachedPromise = regionOptionsApi().then((res) => {
      cachedOptions = res.data || [];
      return cachedOptions;
    });
  }
  return cachedPromise;
};

const CityLinkage = ({
  allowClear = true,
  placeholder = "请选择省市区",
  ...rest
}: CityLinkageProps) => {
  const [options, setOptions] = useState<RegionOption[]>(cachedOptions || []);
  const [loading, setLoading] = useState(!cachedOptions);

  useEffect(() => {
    let mounted = true;

    fetchRegionOptions()
      .then((data) => {
        if (!mounted) return;
        setOptions(data);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Cascader
      options={options}
      allowClear={allowClear}
      placeholder={placeholder}
      changeOnSelect={false}
      showSearch
      loading={loading}
      {...rest}
    />
  );
};

export default CityLinkage;
