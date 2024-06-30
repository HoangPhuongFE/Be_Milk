<<<<<<< HEAD
const { Order, OrderItem, Cart, CartItem, Product, Voucher } = require('../models');
const { createPaymentUrl } = require('./paymentController');
=======
// controllers/orderController.js
const { Order, OrderItem, Cart, CartItem, Product, Voucher, UserVoucher } = require('../models');
>>>>>>> 50b3931a78e4d92c2c0d3e093c1754bfbcd61e06
const { Op } = require('sequelize');


exports.createOrder = async (req, res) => {
  const { voucher_code } = req.body;
  const user_id = req.user.id;

  try {
    const cart = await Cart.findOne({
      where: { user_id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let discount = 0;
    let voucher_id = null;
    let discount_type = null;

    const cart_total = cart.items.reduce((total, item) => total + (item.quantity * item.product.price), 0).toFixed(2);

    if (voucher_code) {
      const voucher = await Voucher.findOne({
        where: { code: voucher_code, expiration_date: { [Op.gt]: new Date() } }
      });
      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found or expired' });
      }

      const userVoucher = await UserVoucher.findOne({
        where: { user_id: user_id, voucher_id: voucher.voucher_id, used: true }
      });

      if (userVoucher) {
        return res.status(400).json({ message: 'You have already used this voucher' });
      }

      if (parseFloat(cart_total) < parseFloat(voucher.minimum_order_value)) {
        return res.status(400).json({ message: `Order total must be at least ${voucher.minimum_order_value} to use this voucher` });
      }

      discount = parseFloat(voucher.discount);
      voucher_id = voucher.voucher_id;
      discount_type = voucher.discount_type;
    }

    let total_amount = parseFloat(cart_total);

    if (discount_type === 'percentage') {
      total_amount = total_amount * ((100 - discount) / 100);
    } else if (discount_type === 'amount') {
      total_amount = total_amount - discount;
    }

    total_amount = total_amount.toFixed(2);

    if (total_amount < 0) total_amount = 0;

    const order = await Order.create({
      user_id,
      status: 'pending',
      total_amount: total_amount,
      voucher_id
    });

    const orderItems = cart.items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    await OrderItem.bulkCreate(orderItems);

    for (let item of cart.items) {
      await Product.update(
        { quantity: item.product.quantity - item.quantity },
        { where: { product_id: item.product_id } }
      );
    }

    if (voucher_id) {
      await UserVoucher.create({
        user_id: user_id,
        voucher_id: voucher_id,
        used: true
      });
    }

    await CartItem.destroy({ where: { cart_id: cart.cart_id } });

     // Tạo URL thanh toán và trả về cho client
     const ipAddr = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);

 const paymentUrl = await createPaymentUrl(order.order_id, total_amount, ipAddr);
    res.status(201).json({ order, paymentUrl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


<<<<<<< HEAD
// tạo order từ cart
=======
>>>>>>> 50b3931a78e4d92c2c0d3e093c1754bfbcd61e06
exports.getUserOrders = async (req, res) => {
  const user_id = req.user.id;

  try {
    const orders = await Order.findAll({
      where: { user_id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  const user_id = req.user.id;
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id, user_id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



exports.updateOrderStatus = async (req, res) => {
  const { order_id, status } = req.body;

  try {
    const order = await Order.findByPk(order_id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'cancelled') {
      // Xoá voucher đã sử dụng
      await UserVoucher.destroy({ where: { user_id: order.user_id, used: true } });
      
      // Trả lại sản phẩm vào giỏ hàng
      const cart = await Cart.findOne({ where: { user_id: order.user_id } });
      if (!cart) {
        // Nếu giỏ hàng chưa tồn tại, tạo mới giỏ hàng
        cart = await Cart.create({ user_id: order.user_id });
      }

      for (const item of order.items) {
        // Tìm kiếm CartItem trong giỏ hàng hiện tại
        let cartItem = await CartItem.findOne({ 
          where: { 
            cart_id: cart.cart_id, 
            product_id: item.product_id 
          } 
        });

        if (cartItem) {
          // Nếu CartItem đã tồn tại, tăng số lượng
          cartItem.quantity += item.quantity;
        } else {
          // Nếu CartItem chưa tồn tại, tạo mới CartItem
          cartItem = await CartItem.create({ 
            cart_id: cart.cart_id, 
            product_id: item.product_id, 
            quantity: item.quantity 
          });
        }

        await cartItem.save();

        // Tăng lại số lượng sản phẩm trong kho
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findByPk(order_id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    for (let item of order.items) {
      await Product.update(
        { quantity: item.product.quantity + item.quantity },
        { where: { product_id: item.product_id } }
      );
    }

    await UserVoucher.destroy({ where: { user_id: order.user_id, used: true } });

    await order.destroy();

    res.status(204).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed' });
  }
};
