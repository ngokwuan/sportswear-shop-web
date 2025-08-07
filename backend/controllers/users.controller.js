import User from '../models/users.model.js'; // Sửa import model

export const show = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Không lấy được người dùng' });
  }
};

export const create = async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        error:
          'Vui lòng điền đầy đủ thông tin bắt buộc (họ tên, email, mật khẩu)',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email này đã được sử dụng',
      });
    }

    // Create new user
    const newUser = await User.create({
      name: fullName, // Map fullName to name field in database
      email,
      password,
      phone: phone || null,
      address: address || null,
      role: 'customer', // Default role
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: 'Thêm người dùng thành công!',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map((err) => err.message),
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email này đã được sử dụng',
      });
    }

    res.status(500).json({
      error: 'Có lỗi xảy ra khi thêm người dùng',
    });
  }
};
