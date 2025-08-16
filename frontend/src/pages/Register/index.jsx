import { useState } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import styles from './Register.module.scss';
import Logo from '../../components/Logo';

const cx = classNames.bind(styles);

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitUserData = async (userData) => {
    try {
      setIsSubmitting(true);
      const res = await axios.post(
        'http://localhost:3000/users/create',
        userData
      );

      // Reset form sau khi thành công
      setFormData({ fullName: '', email: '', password: '' });

      // Hiển thị thông báo thành công với thông tin từ server
      alert(res.data.message || 'Thêm người dùng thành công!');

      return res.data;
    } catch (error) {
      console.error('Lỗi khi thêm người dùng:', error);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Server trả về lỗi với status code
        const errorMessage =
          error.response.data.error || 'Có lỗi xảy ra từ server';
        alert(errorMessage);

        // Nếu có chi tiết lỗi validation
        if (error.response.data.details) {
          console.error('Validation details:', error.response.data.details);
        }
      } else if (error.request) {
        // Không kết nối được với server
        alert('Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi khác
        alert('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên');
      return;
    }

    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }

    if (formData.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    console.log('Dữ liệu người dùng chuẩn bị gửi:', formData);
    await submitUserData(formData);
  };

  const handleGoogleSignup = () => {
    // Xử lý đăng ký Google
    console.log('Google signup');
  };

  const handleAppleSignup = () => {
    // Xử lý đăng ký Apple
    console.log('Apple signup');
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('register-container')}>
        <div className={cx('logo-container')}>
          <Logo />
        </div>
        <div className={cx('header')}>
          <h1 className={cx('title')}>Create Account</h1>
          <p className={cx('subtitle')}>
            Enter your information to create your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className={cx('form')}>
          <div className={cx('input-group')}>
            <label htmlFor="fullName" className={cx('label')}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              className={cx('input')}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              minLength="2"
              maxLength="100"
            />
          </div>

          <div className={cx('input-group')}>
            <label htmlFor="email" className={cx('label')}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className={cx('input')}
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
              maxLength="100"
            />
          </div>

          <div className={cx('input-group')}>
            <label htmlFor="password" className={cx('label')}>
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className={cx('input')}
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength="6"
              maxLength="255"
            />
          </div>

          <button
            type="submit"
            className={cx('register-btn')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className={cx('divider')}>
            <span>Or</span>
          </div>

          <div className={cx('social-buttons')}>
            <button
              type="button"
              className={cx('social-btn', 'google-btn')}
              onClick={handleGoogleSignup}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className={cx('social-icon')}
              />
              Sign up with Google
            </button>
            <button
              type="button"
              className={cx('social-btn', 'apple-btn')}
              onClick={handleAppleSignup}
            >
              <svg
                className={cx('social-icon')}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Sign up with Apple
            </button>
          </div>

          <div className={cx('login-link')}>
            <span>Already have an account? </span>
            <a href="/login" className={cx('login-text')}>
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
