import axios from 'axios';
import { toast } from 'react-toastify';

// Tự động detect môi trường
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : 'https://sportswear-shop-web.onrender.com');

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 30000,
  // Không set Content-Type mặc định, để axios tự động detect
});

instance.interceptors.request.use(
  (config) => {
    // Chỉ set Content-Type là application/json nếu không phải FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // Nếu là FormData, axios sẽ tự động set Content-Type với boundary

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Có lỗi xảy ra';
    const code = error.response?.data?.code;

    // Log để debug
    if (status === 500) {
      console.error('500 Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        headers: error.config?.headers,
      });
    }

    switch (status) {
      case 400: {
        toast.error(message);
        break;
      }
      case 401: {
        if (code === 'INVALID_TOKEN' || code === 'NO_TOKEN') {
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
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

export const testConnection = async () => {
  try {
    const response = await instance.get('/health');
    console.log('Health check:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const testAuth = async () => {
  try {
    const response = await instance.get('/auth/me');
    console.log('Auth check:', response.data);
    return response.data;
  } catch (error) {
    console.error('Auth check failed:', error);
    throw error;
  }
};

export default instance;
