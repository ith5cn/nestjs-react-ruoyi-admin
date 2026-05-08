import React from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import HeroSection from './hero-section';
import LoginForm from './login-form';
import './login.css';

const Login: React.FC = () => {
    const token = useUserStore((state) => state.token);

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <main className="relative min-h-screen flex items-center justify-center ethereal-grid px-6 bg-[#f8fafb] text-[#191c1d] overflow-hidden font-['Inter',sans-serif]">
            {/* Background Auras */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#006971]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#4646d8]/5 rounded-full blur-[120px]"></div>
            
            <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10 py-12">
                {/* Left Side: Branding & Stats */}
                <HeroSection />

                {/* Right Side: Login Card */}
                <LoginForm />
            </div>
        </main>
    );
};

export default Login;
