import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthIndicatorProps {
    password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
    const { t } = useTranslation();

    const strength = useMemo(() => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthText = useMemo(() => {
        if (strength === 0) return t('register.strength.tooShort');
        if (strength <= 2) return t('register.strength.weak');
        if (strength <= 4) return t('register.strength.medium');
        return t('register.strength.strong');
    }, [strength, t]);

    const strengthColor = useMemo(() => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 4) return 'bg-primary';
        return 'bg-green-500';
    }, [strength]);

    return (
        <div className="mt-3">
            <div className="flex gap-1.5 h-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${strength >= i ? strengthColor : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                    ></div>
                ))}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                <span>{t('register.strength.label')} <span className={`${strength > 0 ? 'text-primary' : ''} font-bold`}>{strengthText}</span></span>
                <span>{t('register.strength.suggestion')}</span>
            </div>
        </div>
    );
};
