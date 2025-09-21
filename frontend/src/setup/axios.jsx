// import axios from 'axios';
// import { toast } from 'react-toastify';

// // Vite sử dụng import.meta.env thay vì process.env
// const instance = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL || 'https://sportswear-shop-web.onrender.com',
//   withCredentials: true, // để cookie tự gửi
// });

// instance.interceptors.request.use(
//   (config) => config,
//   (error) => Promise.reject(error)
// );

// instance.interceptors.response.use(
//   (response) => response,
//   (err) => {
//     const status = err.response?.status || 500;
//     const message = err.response?.data?.error || 'Có lỗi xảy ra';

//     switch (status) {
//       case 400:
//       case 401:
//       case 403: {
//         toast.error(message);
//         break;
//       }
//       default: {
//         toast.error(message);
//         break;
//       }
//     }

//     return Promise.reject(err);
//   }
// );

// export default instance;

import axios from 'axios';
import { toast } from 'react-toastify';

// Vite sử dụng import.meta.env thay vì process.env
const baseURL =
  import.meta.env.VITE_API_URL || 'https://sportswear-shop-web.onrender.com';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true, // ✅ Quan trọng: cho phép gửi cookies
  timeout: 30000, // 30s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Debug log trong development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Debug log trong development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Có lỗi xảy ra';
    const code = error.response?.data?.code;

    // Debug log
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status,
        message,
        code,
        url: error.config?.url,
        response: error.response?.data,
      });
    }

    // Xử lý các lỗi cụ thể
    switch (status) {
      case 400: {
        toast.error(message);
        break;
      }
      case 401: {
        // Token hết hạn hoặc không hợp lệ
        if (code === 'INVALID_TOKEN' || code === 'NO_TOKEN') {
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');

          // Có thể redirect về trang đăng nhập
          // window.location.href = '/login';

          // Hoặc dispatch action để clear user state
          // store.dispatch(logoutUser());
        } else {
          toast.error(message);
        }
        break;
      }
      case 403: {
        toast.error('Bạn không có quyền thực hiện hành động này');
        break;
      }
      case 404: {
        toast.error('Không tìm thấy tài nguyên');
        break;
      }
      case 429: {
        toast.error('Quá nhiều yêu cầu, vui lòng thử lại sau');
        break;
      }
      case 500:
      default: {
        toast.error(message || 'Có lỗi xảy ra từ máy chủ');
        break;
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions để test connection
export const testConnection = async () => {
  try {
    const response = await instance.get('/health');
    console.log('🏥 Health check:', response.data);
    return response.data;
  } catch (error) {
    console.error('💔 Health check failed:', error);
    throw error;
  }
};

// Helper function để test authentication
export const testAuth = async () => {
  try {
    const response = await instance.get('/auth/me');
    console.log('🔐 Auth check:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚫 Auth check failed:', error);
    throw error;
  }
};

export default instance;
