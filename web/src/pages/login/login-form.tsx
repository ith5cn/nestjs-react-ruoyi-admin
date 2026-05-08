import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import usePermissionStore from '@/store/usePermissionStore';
import { Form, Input, message } from 'antd';
import { loginApi } from '@/api/auth';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from '@ant-design/icons';

const LoginForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await loginApi(values);
            useUserStore.getState().setToken((res.data as any).accessToken);
            await usePermissionStore.getState().initPermissions();
            message.success("登录成功");
            navigate('/dashboard', { replace: true });
        } catch (error) {
            return;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] p-8 lg:p-10 rounded-[2rem] shadow-[0px_40px_80px_rgba(0,105,113,0.08)] relative overflow-hidden bg-white/70 backdrop-blur-[20px] border border-[#bbc9cb]/15">
                {/* Subtle Interior Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#006971]/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 w-full">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-['Space_Grotesk',sans-serif] font-bold text-[#191c1d] mb-2">欢迎回来</h2>
                        <p className="text-[#3c494b]/60 text-sm">账号：admin 密码：123456</p>
                    </div>

                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        className="space-y-6"
                        requiredMark={false}
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-semibold tracking-widest text-[#006971] uppercase ml-1 block">用户名</label>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: '请输入用户名' }]}
                                className="mb-0 !p-0"
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="用户名"
                                    className="w-full h-14 rounded-xl border-none bg-[#e1e3e4]/30 text-[#191c1d] focus:ring-2 focus:ring-[#006971]/20 focus:bg-white hover:bg-white transition-all [&>input::placeholder]:text-[#3c494b]/30 [&>input]:bg-transparent"
                                />
                            </Form.Item>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold tracking-widest text-[#006971] uppercase ml-1 block border-none">密码</label>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: '请输入密码' }]}
                                className="mb-0 !p-0"
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="密码"
                                    iconRender={(visible) => (visible ? <EyeTwoTone className="text-[#006971]"/> : <EyeInvisibleOutlined className="text-[#3c494b]/40" />)}
                                    className="w-full h-14 rounded-xl border-none bg-[#e1e3e4]/30 text-[#191c1d] focus:ring-2 focus:ring-[#006971]/20 focus:bg-white hover:bg-white transition-all [&>input::placeholder]:text-[#3c494b]/30 [&>input]:bg-transparent"
                                />
                            </Form.Item>
                            
                            <div className="flex justify-end pt-2">
                                <a className="text-xs text-[#3c494b]/60 hover:text-[#006971] transition-colors" href="#">忘记访问令牌?</a>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 bg-[#006971] text-white rounded-xl font-semibold shadow-xl shadow-[#006971]/25 hover:bg-[#005a61] hover:shadow-[#006971]/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            <span>{loading ? '验证中...' : '登录'}</span>
                            {/* {!loading && 11} */}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
