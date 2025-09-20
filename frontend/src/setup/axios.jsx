// import axios from 'axios';
// import { toast } from 'react-toastify';

// const instance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   },
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

// Cấu hình cho same domain deployment
const getBaseURL = () => {
  // Development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // Production: same domain với /api prefix
  return '/api';
};

const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Quan trọng: để gửi cookie
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10s timeout
});

console.log('API Base URL:', getBaseURL());
console.log('Environment:', import.meta.env.MODE);

instance.interceptors.request.use(
  (config) => {
    // Log request trong development
    if (import.meta.env.DEV) {
      console.log(`${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (import.meta.env.DEV) {
      console.log(`Response ${response.status}:`, response.config.url);
    }
    return response;
  },
  (err) => {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Có lỗi xảy ra';

    console.error(`API Error ${status}:`, {
      url: err.config?.url,
      method: err.config?.method,
      message,
    });

    switch (status) {
      case 400: {
        toast.error(`Dữ liệu không hợp lệ: ${message}`);
        break;
      }
      case 401: {
        toast.error('Vui lòng đăng nhập lại');
        // Redirect về trang login sau một chút
        setTimeout(() => {
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }, 1500);
        break;
      }
      case 403: {
        toast.error('Bạn không có quyền truy cập');
        break;
      }
      case 404: {
        toast.error('Không tìm thấy dữ liệu yêu cầu');
        break;
      }
      case 500: {
        toast.error('Lỗi server, vui lòng thử lại sau');
        break;
      }
      default: {
        toast.error(message);
        break;
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
