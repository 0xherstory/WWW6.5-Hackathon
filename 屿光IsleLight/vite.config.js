import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // 完整的CSP配置，允许eval、inline样式、所有必要的资源
      'Content-Security-Policy': 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://api.avax-test.network https://walletconnect.com https://rpc.walletconnect.com wss://*.walletconnect.com; " +
        "worker-src 'self' blob:; " +
        "frame-src 'self' https://walletconnect.com"
    }
  }
})