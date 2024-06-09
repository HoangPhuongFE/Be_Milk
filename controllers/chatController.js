const { Chat, User } = require('../models');
const { Op } = require('sequelize');
let io;

exports.initializeSocket = (socketIo) => {
  io = socketIo;
};

exports.createMessage = async (req, res) => {
  const { message, recipient_id } = req.body;
  //const user_id = req.user.user_id; // Gán đúng user_id từ req.user
  const user_id =req.user?.id

  try {
    const chat = await Chat.create({
      user_id,
      recipient_id,
      message
    });

    // Phát tin nhắn tới tất cả các client
    io.emit('chat message', chat);

    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { user_id },
          { recipient_id: user_id }
        ]
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['user_id', 'email', 'full_name']
      }, {
        model: User,
        as: 'recipient',
        attributes: ['user_id', 'email', 'full_name']
      }]
    });

    res.status(200).json(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
