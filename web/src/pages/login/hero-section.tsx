import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <div className="space-y-12 mb-10 lg:mb-0">
            <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-['Space_Grotesk',sans-serif] font-bold text-[#191c1d] tracking-tight leading-tight">
                    若依 <br/>
                    <span className="text-[#006971]">管理后台</span>
                </h1>
                <p className="text-lg lg:text-xl text-[#3c494b]/80 max-w-md leading-relaxed">
                    支持 字典管理、代码生成、CURD接口、菜单管理、权限管理、日志管理、系统监控
                </p>
            </div>

        </div>
    );
};

export default HeroSection;
