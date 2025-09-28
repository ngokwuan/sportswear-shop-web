import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL =
  import.meta.env.VITE_API_URL || 'https://sportswear-shop-web.onrender.com';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error(' Request interceptor error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Có lỗi xảy ra';
    const code = error.response?.data?.code;

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
    console.log(' Health check:', response.data);
    return response.data;
  } catch (error) {
    console.error(' Health check failed:', error);
    throw error;
  }
};

export const testAuth = async () => {
  try {
    const response = await instance.get('/auth/me');
    console.log(' Auth check:', response.data);
    return response.data;
  } catch (error) {
    console.error(' Auth check failed:', error);
    throw error;
  }
};

export default instance;
