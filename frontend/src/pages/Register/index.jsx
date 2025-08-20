import { useState } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import styles from './Register.module.scss';
import Logo from '../../components/Logo';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
const cx = classNames.bind(styles);

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const defaultValidInput = {
    isValidFullName: true,
    isValidEmail: true,
    isValidPhone: true,
    isValidPassword: true,
    isValidConfirmPassword: true,
  };
  const [objectCheckInput, setObjectCheckInput] = useState(defaultValidInput);
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
        'http://localhost:3000/auth/register',
        userData
      );

      // Reset form sau khi thành công
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      toast.success(res.data.message || 'Thêm người dùng thành công!');

      return res.data;
    } catch (error) {
      console.error('Lỗi khi thêm người dùng:', error);

      if (error.response) {
        const errorMessage =
          error.response.data.error || 'Có lỗi xảy ra từ server';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error(
          'Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng.'
        );
      } else {
        toast.error('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    if (!formData.email.trim()) {
      setObjectCheckInput({ ...defaultValidInput, isValidEmail: false });
      toast.error('Vui lòng nhập email');

      return;
    }
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(formData.email.trim())) {
      setObjectCheckInput({ ...defaultValidInput, isValidEmail: false });

      toast.error('Vui lòng nhập email hợp lệ ');
      return;
    }
    if (!formData.phone.trim()) {
      setObjectCheckInput({ ...defaultValidInput, isValidPhone: false });

      toast.error('Vui lòng nhập sdt');
      return;
    }
    const regexPhoneNumber =
      /^(0|84)(2(0[3-9]|1[0-689]|2[0-25-9]|3[2-9]|4[0-9]|5[124-9]|6[0369]|7[0-7]|8[0-9]|9[012346789])|3[2-9]|5[25689]|7[06-9]|8[0-9]|9[012346789])([0-9]{7})$/gm;
    if (!regexPhoneNumber.test(formData.phone.trim())) {
      setObjectCheckInput({ ...defaultValidInput, isValidPhone: false });

      toast.error('Vui lòng nhập sdt hợp lệ ');
      return;
    }
    if (formData.password.length < 6) {
      setObjectCheckInput({ ...defaultValidInput, isValidPassword: false });

      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (formData.confirmPassword !== formData.password) {
      setObjectCheckInput({
        ...defaultValidInput,
        isValidConfirmPassword: false,
      });

      toast.error('Nhập lại mật khẩu không trùng khớp ');
      return;
    }

    console.log('Dữ liệu người dùng chuẩn bị gửi:', formData);
    await submitUserData(formData);
  };

  const handleGoogleSignup = () => {
    console.log('Google signup');
  };

  const handleAppleSignup = () => {
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
              className={cx('input', {
                'input-error': !objectCheckInput.isValidFullName,
              })}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
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
              className={cx('input', {
                'input-error': !objectCheckInput.isValidEmail,
              })}
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              maxLength="100"
            />
          </div>

          <div className={cx('input-group')}>
            <label htmlFor="phone" className={cx('label')}>
              Phone number
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              className={cx('input', {
                'input-error': !objectCheckInput.isValidPhone,
              })}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              minLength="6"
              maxLength="11"
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
              className={cx('input', {
                'input-error': !objectCheckInput.isValidPassword,
              })}
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength="6"
              maxLength="255"
            />
          </div>
          <div className={cx('input-group')}>
            <label htmlFor="re-enter-password" className={cx('label')}>
              Re-Enter Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="re-enter-password"
              className={cx('input', {
                'input-error': !objectCheckInput.isValidConfirmPassword,
              })}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter-password"
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
            <Link to="/login" className={cx('login-text')}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
