import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 极简黑白灰 + 暖棕色强调
        primary: {
          DEFAULT: '#2C2C2C', // 深灰主色
          light: '#4A4A4A',
          dark: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#F5F5F5', // 浅灰背景
          light: '#FAFAFA',
          dark: '#E8E8E8',
        },
        accent: {
          DEFAULT: '#8B7355', // 暖棕色
          light: '#A68B6A',
          dark: '#6B5A45',
        },
        background: {
          DEFAULT: '#FFFFFF', // 纯白背景
          alt: '#FAFAFA',
        },
        text: {
          DEFAULT: '#2C2C2C', // 深灰文字
          light: '#FFFFFF',
          muted: '#6B6B6B',
        },
        // 状态色 - 柔和灰调
        success: '#4A4A4A',
        warning: '#8B7355',
        error: '#8B6B6B',
      },
      borderRadius: {
        'card': '0px',
        'button': '0px',
        'input': '0px',
        'tag': '0px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'button': '0 1px 2px rgba(0,0,0,0.04)',
        'geometric': '0 0 0 1px rgba(139, 115, 85, 0.2)',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'h1': ['40px', { lineHeight: '1.1', fontWeight: '300', letterSpacing: '-0.02em' }],
        'h2': ['28px', { lineHeight: '1.2', fontWeight: '400', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '1.3', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'tag': ['11px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
        'word-card': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
