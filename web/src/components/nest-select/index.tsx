import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { useEffect } from 'react';
import useDictStore from '@/store/useDictStore';

interface NestSelectProps extends Omit<SelectProps, 'options'> {
    dict: string;
}

const NestSelect: React.FC<NestSelectProps> = ({ dict, ...rest }) => {
    const { dictMap, isLoaded, fetchDictAll } = useDictStore();

    useEffect(() => {
        if (!isLoaded) fetchDictAll();
    }, [isLoaded, fetchDictAll]);

    const options = (dictMap[dict] ?? []).map((item) => ({
        label: item.label,
        value: item.value,
    }));

    return <Select allowClear options={options} {...rest} />;
};

export default NestSelect;
