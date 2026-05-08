import { create } from 'zustand';
import { dictAllApi } from '@/api/system/dict';

export interface DictDataItem {
    id: number;
    typeId: number;
    label: string;
    value: string;
    color: string;
    code: string;
    sort: number;
    status: number;
    remark: string;
}

interface DictState {
    dictMap: Record<string, DictDataItem[]>;
    isLoaded: boolean;
    fetchDictAll: () => Promise<void>;
}

const useDictStore = create<DictState>((set, get) => ({
    dictMap: {},
    isLoaded: false,

    fetchDictAll: async () => {
        if (get().isLoaded) return;
        try {
            const res = await dictAllApi() as any;
            if (res.code === 0 && res.data) {
                set({ dictMap: res.data, isLoaded: true });
            }
        } catch {
            // ignore
        }
    },
}));

export default useDictStore;
