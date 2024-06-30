const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { sequelize } = require('./models');
const chatController = require('./controllers/chatController');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const swaggerDocs = require('./config/swagger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

chatController.initializeSocket(io);

const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Endpoint để trả về tài liệu Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Định tuyến cho các tài liệu API
app.use('/api-docs', basicAuth({
  users: { 'admin': '1234' },
  challenge: true
}), swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Các định tuyến khác
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const articleRoutes = require('./routes/articleRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payments', paymentRoutes);

// Route cho URL gốc
app.get('/', (req, res) => {
  res.send('Welcome to the Be Milk API! <a href="/api-docs">API Documentation</a>');
});

// Socket.IO configuration
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
