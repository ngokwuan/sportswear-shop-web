import React, { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import axios from '../../../setup/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Logo from '../../../components/Logo';
import { UserContext } from '../../../context/UserContext';

const cx = classNames.bind(styles);

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh, user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const defaultValidInput = {
    isValidEmail: true,
    isValidPassword: true,
  };
  const [objectCheckInput, setObjectCheckInput] = useState(defaultValidInput);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getRedirectPath = (userRole, from) => {
    console.log('🔍 Determining redirect path:', { userRole, from });

    if (from?.startsWith('/admin')) {
      const path = userRole === 'admin' ? from : '/admin/dashboard';
      console.log(' Admin route detected, redirecting to:', path);
      return path;
    }

    let redirectPath;
    switch (userRole) {
      case 'admin':
        redirectPath = '/admin/dashboard';
        console.log(' Admin user, redirecting to admin dashboard');
        break;
      case 'customer':
        redirectPath = from && !from.startsWith('/admin') ? from : '/';
        console.log(' Customer user, redirecting to:', redirectPath);
        break;
      default:
        redirectPath = '/';
        console.log(' Default redirect to home');
    }

    return redirectPath;
  };

  const submitLoginData = async (userData) => {
    try {
      setIsSubmitting(true);
      console.log(' Submitting login data:', { email: userData.email });

      const res = await axios.post('/auth/login', userData);
      console.log(' Login response:', res.data);

      toast.success(res.data.message);

      console.log(' Refreshing user context...');
      await refresh();

      let userRole = res.data.role || res.data.user?.role;

      if (!userRole) {
        console.log(' Waiting for context to update...');
        setTimeout(async () => {
          const contextUser = user;
          userRole = contextUser?.role;
          console.log(' User role from context:', userRole);

          performRedirect(userRole);
        }, 500);
        return res.data;
      }

      performRedirect(userRole);
      return res.data;
    } catch (error) {
      console.error(' Login error:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Có lỗi xảy ra khi đăng nhập');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const performRedirect = (userRole) => {
    console.log('🏃‍♂️ Performing redirect for role:', userRole);

    const from = location.state?.from?.pathname;
    const redirectPath = getRedirectPath(userRole, from);

    console.log(' Redirect info:', {
      userRole: userRole,
      fromPath: from,
      redirectPath: redirectPath,
    });

    if (userRole === 'admin') {
      console.log(' Admin redirect - immediate navigation to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } else {
      setTimeout(() => {
        console.log(
          ' Customer redirect - delayed navigation to:',
          redirectPath
        );
        navigate(redirectPath, { replace: true });
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setObjectCheckInput(defaultValidInput);

    if (!formData.email.trim()) {
      setObjectCheckInput({ ...defaultValidInput, isValidEmail: false });
      toast.error('Vui lòng nhập email');
      return;
    }

    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(formData.email.trim())) {
      setObjectCheckInput({ ...defaultValidInput, isValidEmail: false });
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }

    if (formData.password.length < 6) {
      setObjectCheckInput({ ...defaultValidInput, isValidPassword: false });
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    await submitLoginData(formData);
  };

  const testAdminRedirect = () => {
    console.log(' Testing admin redirect...');
    navigate('/admin/dashboard', { replace: true });
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
    toast.info('Tính năng đang phát triển');
  };

  const handleAppleLogin = () => {
    console.log('Apple login');
    toast.info('Tính năng đang phát triển');
  };

  const isAdminAccess = location.state?.from?.pathname?.startsWith('/admin');

  return (
    <div className={cx('wrapper')}>
      <div className={cx('login-container')}>
        <div className={cx('logo-container')}>
          <Logo />
        </div>
        <div className={cx('header')}>
          <h1 className={cx('title')}>
            {isAdminAccess ? 'Admin Login' : 'Welcome back!'}
          </h1>
          <p className={cx('subtitle')}>
            {isAdminAccess
              ? 'Access admin dashboard with your credentials'
              : 'Enter your Credentials to access your account'}
          </p>
        </div>

        {isAdminAccess && (
          <div className={cx('admin-notice')}>
            <p>🔐 Bạn cần quyền admin để truy cập trang này</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={cx('form')}>
          <div className={cx('input-group')}>
            <label htmlFor="email" className={cx('label')}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className={cx('input', {
                'input-error': !objectCheckInput.isValidEmail,
              })}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className={cx('input-group')}>
            <div className={cx('label-row')}>
              <label htmlFor="password" className={cx('label')}>
                Password
              </label>
              <a href="#" className={cx('forgot-password')}>
                forgot password
              </a>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              className={cx('input', {
                'input-error': !objectCheckInput.isValidPassword,
              })}
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
            />
          </div>

          <div className={cx('remember-group')}>
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              className={cx('checkbox')}
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label htmlFor="rememberMe" className={cx('remember-label')}>
              Remember for 30 days
            </label>
          </div>

          <button
            type="submit"
            className={cx('login-btn')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Login'}
          </button>

          {!isAdminAccess && (
            <>
              <div className={cx('divider')}>
                <span>Or</span>
              </div>

              <div className={cx('social-buttons')}>
                <button
                  type="button"
                  className={cx('social-btn', 'google-btn')}
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    className={cx('social-icon')}
                  />
                  Sign in with Google
                </button>
                <button
                  type="button"
                  className={cx('social-btn', 'apple-btn')}
                  onClick={handleAppleLogin}
                >
                  <svg
                    className={cx('social-icon')}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Sign in with Apple
                </button>
              </div>
            </>
          )}

          <div className={cx('signup-link')}>
            <span>Don't have an account? </span>
            <Link to="/register" className={cx('signup-text')}>
              Sign Up
            </Link>
          </div>

          {isAdminAccess && (
            <div className={cx('back-home')}>
              <Link to="/" className={cx('back-link')}>
                ← Về trang chủ
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
