const { Chat, User, Messager } = require('../models');
const { Op } = require('sequelize');
let io;

exports.initializeSocket = (socketIo) => {
  io = socketIo;
  io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('join room', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('leave room', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

exports.createMessage = async (req, res) => {
  const { message, recipient_id } = req.body;
  const user_id = req.user.id;

  try {
    const sender = await User.findByPk(user_id);
    const recipient = await User.findByPk(recipient_id);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User or recipient not found' });
    }

    let messager = await Messager.findOne({
      where: {
        [Op.or]: [
          { user1_id: user_id, user2_id: recipient_id },
          { user1_id: recipient_id, user2_id: user_id }
        ]
      }
    });

    if (!messager) {
      messager = await Messager.create({
        user1_id: user_id,
        user2_id: recipient_id
      });
    }

    const chat = await Chat.create({
      user_id,
      recipient_id,
      messager_id: messager.messager_id,
      message
    });

    const fullMessage = {
      ...chat.get(),
      user: sender,
      recipient: recipient
    };

    io.to(messager.messager_id).emit('chat message', fullMessage);

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error(`Error creating message: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.getMessagers = async (req, res) => {
  try {
    const messagers = await Messager.findAll({
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        }
      ]
    });

    res.status(200).json(messagers);
  } catch (error) {
    console.error(`Error fetching messagers: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.getUserMessagers = async (req, res) => {
  const user_id = req.user.id;

  try {
    const messagers = await Messager.findAll({
      where: {
        [Op.or]: [
          { user1_id: user_id },
          { user2_id: user_id }
        ]
      },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        },
        {
          model: User,
          as: 'user2',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        }
      ]
    });

    res.status(200).json(messagers);
  } catch (error) {
    console.error(`Error fetching messagers: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.getChatsByMessagerId = async (req, res) => {
  const { messager_id } = req.params;

  try {
    const chats = await Chat.findAll({
      where: { messager_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'email', 'full_name', 'avatar_url']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['user_id', 'email', 'full_name', 'avatar_url']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error(`Error fetching chats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.getUserChatsByMessagerId = async (req, res) => {
  const { messager_id } = req.params;
  const user_id = req.user.id;

  try {
    // Kiểm tra xem người dùng có tham gia cuộc trò chuyện này không
    const messager = await Messager.findOne({
      where: {
        messager_id,
        [Op.or]: [
          { user1_id: user_id },
          { user2_id: user_id }
        ]
      }
    });

    if (!messager) {
      return res.status(403).json({ message: 'Access Denied: You are not part of this conversation' });
    }

    const chats = await Chat.findAll({
      where: { messager_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['user_id', 'email', 'full_name','avatar_url']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error(`Error fetching chats: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMessager = async (req, res) => {
  const { messager_id } = req.params;

  try {
    // Kiểm tra xem messager có tồn tại không
    const messager = await Messager.findByPk(messager_id);

    if (!messager) {
      return res.status(404).json({ message: 'Messager not found' });
    }

    // Xóa tất cả các tin nhắn liên quan đến messager
    await Chat.destroy({
      where: { messager_id }
    });

    // Xóa messager
    await messager.destroy();

    res.status(200).json({ message: 'Messager deleted successfully' });
  } catch (error) {
    console.error(`Error deleting messager: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};
