const { Order, OrderItem, Cart, CartItem, Product, Voucher } = require('../models');
const { createPaymentUrl } = require('./paymentController');
const { Op } = require('sequelize');


exports.createOrder = async (req, res) => {
  const { voucher_code } = req.body;
  const user_id = req.user.id;

  try {
    // cart lấy từ user_id
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
    // tìm voucher nếu có thì kiểm tra điều kiện
    if (voucher_code) {
      const voucher = await Voucher.findOne({
        where: { code: voucher_code, expiration_date: { [Op.gt]: new Date() }, used: false }
      });
      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found or expired' });
      }
      // kiểm giá trị đơn hàng tối thiểu
      if (cart_total < voucher.minimum_order_value) {
        return res.status(400).json({ message: `Order total must be at least ${voucher.minimum_order_value} to use this voucher` });
      }

      discount = voucher.discount;
      voucher_id = voucher.voucher_id;
      discount_type = voucher.discount_type;
    }
    // tính tổng tiền sau khi giảm giá nếu có voucher 
    let total_amount = cart_total;

    if (discount_type === 'percentage') {
      total_amount = cart_total * ((100 - discount) / 100);
    } else if (discount_type === 'amount') {
      total_amount = cart_total - discount;
    }

    if (total_amount < 0) total_amount = 0; // Đảm bảo tổng tiền không âm

    const order = await Order.create({
      user_id,
      status: 'pending',
      total_amount,
      voucher_id
    });
     // tạo order item từ cart item 
    const orderItems = cart.items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    await OrderItem.bulkCreate(orderItems);

    // Giảm số lượng sản phẩm trong kho
    for (let item of cart.items) {
      await Product.update(
        { quantity: item.product.quantity - item.quantity },
        { where: { product_id: item.product_id } }
      );
    }
    // nếu có voucher thì cập nhật trạng thái voucher đã sử dụng 
    if (voucher_id) {
      await Voucher.update(
        { used: true },
        { where: { voucher_id } }
      );
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


// tạo order từ cart
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
// lấy order theo id
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
// cập nhật trạng thái order 
exports.updateOrderStatus = async (req, res) => {
  const { order_id, status } = req.body;

  try {
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// xóa order 
exports.deleteOrder = async (req, res) => {
  const { order_id } = req.params;

  try {
    const order = await Order.findByPk(order_id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Cộng lại số lượng sản phẩm vào kho
    for (let item of order.items) {
      await Product.update(
        { quantity: item.product.quantity + item.quantity },
        { where: { product_id: item.product_id } }
      );
    }

    await order.destroy();

    res.status(204).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//