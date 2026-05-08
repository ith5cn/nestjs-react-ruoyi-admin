import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './zh-CN';
import enUS from './en-US';

i18n
    .use(LanguageDetector) // 自动检测浏览器语言
    .use(initReactI18next)
    .init({
        resources: {
            'zh-CN': { translation: zhCN },
            'en-US': { translation: enUS },
        },
        fallbackLng: 'zh-CN', // 默认语言
        interpolation: {
            escapeValue: false, // React 已经处理了 XSS
        },
    });

export default i18n;