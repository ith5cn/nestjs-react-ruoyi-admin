import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { registerApi } from '@/api/auth';

interface RegistrationFormProps {
    onComplete: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [password, setPassword] = useState('');

    const onFinish = async (_values: any) => {
        setIsSubmitting(true);
        try {
            await registerApi(_values);
            message.success("注册成功");

            // message.success(t('register.success', 'Registration successful!'));
            onComplete();
        } catch (error) {
            // Error is handled by interceptor or ignored here
        } finally {
            setIsSubmitting(false);
        }


    };

    const handleValuesChange = (changedValues: any) => {
        if (changedValues.password !== undefined) {
            setPassword(changedValues.password);
        }
    };

    return (
        <>

            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{t('register.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t('register.subtitle')}</p>
            </div>

            {/* Form */}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleValuesChange}
                size="large"
                className="space-y-2"
            >
                {/* Username */}
                <Form.Item
                    name="username"
                    label={t('register.username')}
                    rules={[{ required: true, message: t('register.username.placeholder') }]}
                >
                    <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder={t('register.username.placeholder')}
                        className="py-3"
                    />
                </Form.Item>

                {/* Email */}
                <Form.Item
                    name="email"
                    label={t('register.email')}
                    rules={[
                        { required: true, message: t('login.email.required') },
                        { type: 'email', message: t('login.email.invalid') }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-slate-400" />}
                        placeholder={t('register.email.placeholder')}
                        className="py-3"
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    name="password"
                    label={t('register.password')}
                    rules={[{ required: true, message: t('login.password.required') }, { min: 8, message: t('register.strength.tooShort') }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder={t('register.password.placeholder')}
                        className="py-3"
                    />
                </Form.Item>

                <PasswordStrengthIndicator password={password} />

                {/* Confirm Password */}
                <Form.Item
                    name="confirmPassword"
                    label={t('register.confirmPassword')}
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: t('register.confirmPassword.placeholder') },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('register.passwordMismatch')));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<SafetyCertificateOutlined className="text-slate-400" />}
                        placeholder={t('register.confirmPassword.placeholder')}
                        className="py-3"
                    />
                </Form.Item>

                {/* Terms */}

                {/* Submit Button */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        block
                        size="large"
                        className="h-12 text-base font-bold shadow-lg shadow-primary/20"
                    >
                        {t('register.submit')}
                    </Button>
                </Form.Item>
            </Form>

            {/* Secondary Action */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {t('register.hasAccount')} <a className="text-primary font-bold hover:underline" href="/login">{t('register.login')}</a>
                </p>
            </div>

        </>
    );
};
