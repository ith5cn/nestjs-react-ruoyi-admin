import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
    token: string | null;
    userInfo: any;
    roles: string[];
    permissions: string[];
    // Actions
    setToken: (token: string) => void;
    setUserInfo: (info: any) => void;
    setRoles: (roles: string[]) => void;
    setPermissions: (permissions: string[]) => void;
    logout: () => void;
}

const useUserStore = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                token: localStorage.getItem('token') || null,
                userInfo: {},
                roles: [],
                permissions: [],

                setToken: (token) => {
                    localStorage.setItem('token', token);
                    set({ token });
                },

                setUserInfo: (userInfo) => set({ userInfo }),

                setRoles: (roles) => set({ roles }),

                setPermissions: (permissions) => set({ permissions }),

                logout: () => {
                    localStorage.removeItem('token');
                    set({ token: null, userInfo: {}, roles: [], permissions: [] });
                },
            }),
            {
                name: 'user-storage', // 持久化存储的 Key
                partialize: (state) => ({ token: state.token }), // 只持久化 token
            }
        )
    )
);

export default useUserStore;