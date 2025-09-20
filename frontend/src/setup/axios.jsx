import axios from 'axios';
import { toast } from 'react-toastify';

// Vite sử dụng import.meta.env thay vì process.env
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // để cookie tự gửi
});

instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (err) => {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || 'Có lỗi xảy ra';

    switch (status) {
      case 400:
      case 401:
      case 403: {
        toast.error(message);
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
