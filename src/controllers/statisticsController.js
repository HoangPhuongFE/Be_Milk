const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Thống kê doanh thu theo thời gian
exports.getRevenueStatistics = async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    let groupBy, dateRange;

    switch (period) {
      case 'day':
        groupBy = [sequelize.fn('DATE', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 DAY)"), sequelize.literal("NOW()")];
        break;
      case 'week':
        groupBy = [sequelize.fn('WEEK', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 WEEK)"), sequelize.literal("NOW()")];
        break;
      case 'month':
        groupBy = [sequelize.fn('MONTH', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 MONTH)"), sequelize.literal("NOW()")];
        break;
      case 'year':
        groupBy = [sequelize.fn('YEAR', sequelize.col('createdAt'))];
        dateRange = [sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 YEAR)"), sequelize.literal("NOW()")];
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
      order: [[sequelize.col('createdAt'), 'ASC']]
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
      group: ['product_id'],
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
      group: ['User.user_id'],
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
