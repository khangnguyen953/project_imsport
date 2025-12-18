import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cấu hình Proxy để tránh CORS
    proxy: {
      // 1. Khi gọi API có tiền tố '/api'
      '/api': {
        // 2. Chuyển hướng đến Backend thực tế
        target: 'https://od1ss7mik1.execute-api.ap-southeast-1.amazonaws.com/api', // Hoặc URL AWS API Gateway của bạn
        
        // 3. Đổi Origin của Header (Quan trọng khi gọi sang AWS hoặc server khác domain)
        changeOrigin: true,
        
        // 4. (Tùy chọn) Viết lại đường dẫn nếu backend không có prefix '/api'
        // Ví dụ: Frontend gọi '/api/chat' -> Backend nhận '/chat'
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
