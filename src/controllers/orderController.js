// controllers/orderController.js
const { Order, OrderItem, Cart, CartItem, Product, Voucher, UserVoucher } = require('../models');
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

    const cart_total = cart.items.reduce((total, item) => total + (item.quantity * item.product.price), 0);

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

      if (cart_total < voucher.minimum_order_value) {
        return res.status(400).json({ message: `Order total must be at least ${voucher.minimum_order_value} to use this voucher` });
      }

      discount = voucher.discount;
      voucher_id = voucher.voucher_id;
      discount_type = voucher.discount_type;
    }

    let total_amount = cart_total;

    if (discount_type === 'percentage') {
      total_amount = cart_total * ((100 - discount) / 100);
    } else if (discount_type === 'amount') {
      total_amount = cart_total - discount;
    }

    if (total_amount < 0) total_amount = 0;

    const order = await Order.create({
      user_id,
      status: 'pending',
      total_amount,
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

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'cancelled') {
      await UserVoucher.destroy({ where: { user_id: order.user_id, used: true } });
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
