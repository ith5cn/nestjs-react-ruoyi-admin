import React from 'react';
import { CloudOutlined } from '@ant-design/icons';
import { BrandingSection } from './branding-section';
import { RegistrationForm } from './register-form';
import './index.css';
import { redirect } from 'react-router-dom';

const Register: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-slate-900">
            {/* Left Section: Branding/Hero */}
            <BrandingSection />

            {/* Right Section: Form Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-20 overflow-y-auto">
                <div className="w-full max-w-[440px] flex flex-col justify-center min-h-full">
                    {/* Mobile Branding (only visible on small screens) */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-2xl"><CloudOutlined /></span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CloudAgent</h2>
                    </div>

                    <RegistrationForm onComplete={() => redirect('/login')} />
                </div>
            </div>
        </div>
    );
};

export default Register;
