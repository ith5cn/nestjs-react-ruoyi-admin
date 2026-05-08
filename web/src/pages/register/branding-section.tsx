
import { CloudOutlined, GlobalOutlined, SafetyOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const BrandingSection: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="hidden lg:flex lg:w-1/2 mesh-gradient relative flex-col justify-between p-16 overflow-hidden">
            {/* Abstract Network Background Decoration */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCFsM_rp7qIg-z3yLkDVV3GHQN35061gr-XRIliofGPeRhq12DckacZw__w24VxS2PY9cqsQ43oLM1Mn2jzL4e45ZWDgV-VoDgeMuWvl70BV7f3Dh9Wyjdyc_jbxzpy1Eq5YS3LKLeG_Ta1RG06HkymvJePm7h7LawhZWeVyiULkSiQRynpBBjPfBKXn0q0uyiWjasBDE7fBibAFc8t2CFYoBPEsnT28PjEtcI1znQuTvWdFdpxuTlcOUNG9P3CdaUlJLrbZ3Qr40k')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 text-white mb-12">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl"><CloudOutlined /></span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">CloudAgent</h2>
                </div>

                <div className="max-w-md">
                    <h1 className="text-white text-5xl font-black leading-tight mb-6" dangerouslySetInnerHTML={{ __html: t('register.hero.title').replace(' ', '<br />') }}>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                        {t('register.hero.subtitle')}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-xl">
                            <div className="text-primary mb-2">
                                <span className="material-symbols-outlined text-3xl"><GlobalOutlined /></span>
                            </div>
                            <div className="text-white text-2xl font-bold">2800+</div>
                            <div className="text-slate-400 text-sm">{t('register.hero.nodes')}</div>
                        </div>
                        <div className="glass-card p-6 rounded-xl">
                            <div className="text-primary mb-2">
                                <span className="material-symbols-outlined text-3xl"><SafetyOutlined /></span>
                            </div>
                            <div className="text-white text-2xl font-bold">99.99%</div>
                            <div className="text-slate-400 text-sm">{t('register.hero.availability')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 text-slate-500 text-sm">
                <span>{t('register.hero.copyright')}</span>
            </div>
        </div>
    );
};
