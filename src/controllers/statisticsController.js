const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Thống kê doanh thu theo thời gian
exports.getRevenueStatistics = async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    let groupBy, dateRange, orderBy;

    switch (period) {
      case 'day':
        groupBy = [sequelize.fn('DATE', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 DAY)"), sequelize.literal("NOW()")];
        orderBy = sequelize.literal('DATE(createdAt)');
        break;
      case 'week':
        groupBy = [sequelize.fn('WEEK', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 WEEK)"), sequelize.literal("NOW()")];
        orderBy = sequelize.literal('WEEK(createdAt)');
        break;
      case 'month':
        groupBy = [sequelize.fn('MONTH', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 MONTH)"), sequelize.literal("NOW()")];
        orderBy = sequelize.literal('MONTH(createdAt)');
        break;
      case 'year':
        groupBy = [sequelize.fn('YEAR', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 YEAR)"), sequelize.literal("NOW()")];
        orderBy = sequelize.literal('YEAR(createdAt)');
        break;
      default:
        return res.status(400).send('Invalid period');
    }

    const revenueData = await Order.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
        ...groupBy
      ],
      where: {
        createdAt: {
          [Op.between]: dateRange
        }
      },
      group: groupBy,
      order: [orderBy]
    });

    res.status(200).json(revenueData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thống kê số lượng đơn hàng theo trạng thái
exports.getOrderStatusCounts = async (req, res) => {
  try {
    const statusCounts = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']
      ],
      group: ['status']
    });

    res.status(200).json(statusCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thống kê sản phẩm bán chạy
exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_sold']
      ],
      include: [{ model: Product, as: 'product', attributes: ['product_name'] }],
      group: ['product_id', 'product.product_name'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
      limit: 10
    });

    res.status(200).json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thống kê khách hàng
exports.getCustomerStatistics = async (req, res) => {
  try {
    const customerData = await User.findAll({
      attributes: [
        'user_id',
        'full_name',
        [sequelize.fn('COUNT', sequelize.col('Orders.order_id')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('Orders.total_amount')), 'total_spent']
      ],
      include: [{ model: Order, as: 'orders', attributes: [] }],
      group: ['User.user_id', 'User.full_name'],
      order: [[sequelize.fn('SUM', sequelize.col('Orders.total_amount')), 'DESC']]
    });

    res.status(200).json(customerData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thống kê doanh thu theo phương thức thanh toán
exports.getRevenueByPaymentMethod = async (req, res) => {
  try {
    const revenueData = await Order.findAll({
      attributes: [
        'payment_method',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
      ],
      group: ['payment_method']
    });

    res.status(200).json(revenueData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thống kê sản phẩm
exports.getProductStatistics = async (req, res) => {
  try {
    // Lấy thống kê từng sản phẩm
    const productStats = await Product.findAll({
      attributes: [
        'product_id',
        'product_name',
        'quantity', // Số lượng tồn kho
        [sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'total_sold'],
        [sequelize.fn('SUM', sequelize.col('orderItems.price')), 'total_revenue']
      ],
      include: [{
        model: OrderItem, as: 'orderItems',
        attributes: []
      }],
      group: ['Product.product_id', 'Product.product_name', 'Product.quantity'],
      order: [[sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'DESC']]
    });

    // Tính tổng số lượng sản phẩm đã bán và tổng doanh thu
    const totalStats = await OrderItem.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('price')), 'total_revenue']
      ]
    });

    res.status(200).json({
      productStats,
      totalStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
