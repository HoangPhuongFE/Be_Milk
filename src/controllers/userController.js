const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize'); 

// Đăng ký người dùng
exports.register = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Kiểm tra nếu người dùng đã tồn tại
    const emailExist = await User.findOne({ where: { email } });
    if (emailExist) return res.status(400).json({ message: 'Email already exists' });

    // Kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain a special character' });
    }

    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 or 11 digits long' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email is not found' });

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });
    // console.log('User:', validPass); // Debug statement

    // Create and assign JWT
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated Token:', token); // Debug statement
    res.header('Authorization', 'Bearer ' + token).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy thông tin người dùng
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy tất cả người dùng (Chỉ dành cho Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { phone, gender, full_name, birthday, address, avatar_url } = req.body;

    // Kiểm tra số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10 or 11 digits long' });
    }

    // Kiểm tra giá trị hợp lệ cho giới tính
    const validGenders = ['male', 'female', 'other'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }

    // Kiểm tra định dạng ngày sinh
    if (birthday && isNaN(Date.parse(birthday))) {
      return res.status(400).json({ message: 'Invalid date format for birthday' });
    }

    // Tìm người dùng theo ID
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cập nhật thông tin người dùng
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.full_name = full_name || user.full_name;
    user.birthday = birthday || user.birthday;
    user.address = address || user.address;
    user.avatar_url = avatar_url || user.avatar_url;

    await user.save();

    res.status(200).json({ message: 'User information updated successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Phân quyền người dùng (Chỉ dành cho Admin)
exports.assignRole = async (req, res) => {
  const { user_id, role } = req.body;

  if (!['admin', 'staff', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'Role assigned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Xóa người dùng (Chỉ dành cho Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: { user_id: userId } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Quên mật khẩu (send reset token)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = token;
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.update({ resetPasswordToken, resetPasswordExpires });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             http://${req.headers.host}/api/users/reset-password/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset password email sent successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Tìm người dùng với token và thời gian hết hạn
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Mật khẩu phải dài ít nhất 8 ký tự và chứa ký tự đặc biệt' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cập nhật mật khẩu và xóa token đặt lại mật khẩu
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id, {
      attributes: ['user_id', 'full_name', 'email', 'avatar_url'] // Chỉ lấy những thông tin cần thiết
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};