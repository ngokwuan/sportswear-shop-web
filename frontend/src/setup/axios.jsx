import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // để cookie tự gửi
});

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    // Không cần set Authorization nếu token nằm trong HttpOnly cookie
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (err) {
    const status = err.response?.status || 500;
    switch (status) {
      case 401: {
        toast.error('Unauthorized. Please login...');
        return Promise.reject(err);
      }
      case 403: {
        toast.error("You don't have permission...");
        return Promise.reject(err);
      }
      default: {
        return Promise.reject(err);
      }
    }
  }
);

export default instance;
