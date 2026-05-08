import { userAuthListApi } from "@/api/system/user";
import { Select } from "antd";
import { useEffect, useState } from "react";

interface AuthSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const AuthSelect: React.FC<AuthSelectProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    userAuthListApi().then((res) => {
      setOptions(res.data);
    });
  }, []);
  return <Select options={options} value={value} className="min-w-[120px]" onChange={onChange} />;
};

export default AuthSelect;
