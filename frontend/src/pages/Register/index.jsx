import { useState } from 'react';
import axios from 'axios';
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
      if (error.res) {
        // Server trả về lỗi với status code
        const errorMessage = error.res.data.error || 'Có lỗi xảy ra từ server';
        alert(errorMessage);

        // Nếu có chi tiết lỗi validation
        if (error.res.data.details) {
          console.error('Validation details:', error.res.data.details);
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

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title mb-0">👤 Thêm người dùng mới</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                  minLength="2"
                  maxLength="100"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  maxLength="100"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  required
                  minLength="6"
                  maxLength="255"
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-success btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Đang xử lý...' : '✅ Thêm người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
