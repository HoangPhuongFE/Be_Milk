const { Chat, User } = require('../models');
const { Op } = require('sequelize');
let io;

exports.initializeSocket = (socketIo) => {
  io = socketIo;
};

exports.createMessage = async (req, res) => {
  const { message, recipient_id } = req.body;
  const user_id = req.user.id;

  try {
    // Kiểm tra xem user_id và recipient_id có tồn tại trong bảng users không
    const sender = await User.findByPk(user_id);
    const recipient = await User.findByPk(recipient_id);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User or recipient not found' });
    }

    // Tạo bản ghi tin nhắn mới
    const chat = await Chat.create({
      user_id,
      recipient_id,
      message
    });

    // Phát tin nhắn tới tất cả các client
    io.emit('chat message', chat);

    res.status(201).json(chat);
  } catch (error) {
    console.error(`Error creating message: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const user_id = req.user.id;

  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { user_id: user_id },
          { recipient_id: user_id }
        ]
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'email', 'full_name']
      }, {
        model: User,
        as: 'recipient',
        attributes: ['user_id', 'email', 'full_name']
      }]
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error(`Error fetching messages: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};
