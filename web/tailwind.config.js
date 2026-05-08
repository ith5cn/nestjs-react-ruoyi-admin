/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1978e5",
                "brand-dark": "#0e141b",
                "brand-muted": "#4e7097",
                "brand-bg": "#f6f7f8",
                "border-gray": "#d0dbe7"
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"]
            }
        }
    },
    plugins: [],
    // 重点：解决 Tailwind 与 Ant Design 样式冲突（预设样式重置问题）
    corePlugins: {
        preflight: false,
    }
}