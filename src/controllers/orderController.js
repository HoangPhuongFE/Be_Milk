const { Order, OrderItem, Cart, CartItem, Product, Voucher, UserVoucher, User } = require('../models');
const { Op } = require('sequelize');

exports.createOrder = async (req, res) => {
  const { voucher_code, payment_method } = req.body;
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

    // Check product quantities before creating the order
    for (let item of cart.items) {
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({ message: `Quantity for product ${item.product.product_name} exceeds available stock` });
      }
      if (item.product.status === 'discontinued') {
        return res.status(400).json({ message: `Product ${item.product.product_name} is discontinued` });
      }
    }

    const order = await Order.create({
      user_id,
      status: 'pending',
      total_amount: total_amount,
      voucher_id,
      payment_method 
    });

    const orderItems = cart.items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    await OrderItem.bulkCreate(orderItems);

    for (let item of cart.items) {
      const newQuantity = item.product.quantity - item.quantity;
      const newStatus = newQuantity === 0 ? 'out_of_stock' : item.product.status;

      await Product.update(
        { quantity: newQuantity, status: newStatus },
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
  const { order_id } = req.params;

  try {
    const order = await Order.findOne({
      where: { order_id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // check xem đúng user chưa nếu đúg thì xổ , không đúng next
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this order' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });

    res.status(200).json(orders);
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
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'cancelled') {
      // Xoá voucher đã sử dụng
      await UserVoucher.destroy({ where: { user_id: order.user_id, used: true } });
      
      // Trả lại sản phẩm vào giỏ hàng
      let cart = await Cart.findOne({ where: { user_id: order.user_id } });
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
          // Update the status based on the new quantity
          if (product.quantity === 0) {
            product.status = 'out_of_stock';
          } else if (product.quantity > 0) {
            product.status = 'available';
          }
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
