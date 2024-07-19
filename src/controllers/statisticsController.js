const { Order, User, OrderItem, Product } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Helper function to get week query
function getWeekQuery() {
  return {
    attributes: [
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
      [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
      [sequelize.literal(`
        CONCAT(
          YEAR(createdAt),
          '-W',
          LPAD(WEEK(createdAt, 1), 2, '0')
        )
      `), 'period']
    ],
    group: [sequelize.literal(`
      CONCAT(
        YEAR(createdAt),
        '-W',
        LPAD(WEEK(createdAt, 1), 2, '0')
      )
    `)],
    order: [sequelize.literal('period')]
  };
}

// Helper function to fill in missing dates
function fillMissingDates(data, period, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let filledData = [];

  if (period === 'day') {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      const existingData = data.find(item => item.period === dateString);
      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ total_revenue: 0, total_orders: 0, period: dateString });
      }
    }
  } else if (period === 'week') {
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const weekNumber = getWeekNumber(current);
      const weekString = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
      const existingData = data.find(item => item.period === weekString);
      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ total_revenue: 0, total_orders: 0, period: weekString });
      }
      current.setDate(current.getDate() + 7);
    }
  } else if (period === 'month') {
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const monthString = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
      const existingData = data.find(item => item.period === monthString);
      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ total_revenue: 0, total_orders: 0, period: monthString });
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else if (period === 'year') {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const yearString = y.toString();
      const existingData = data.find(item => item.period == yearString);
      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({ total_revenue: 0, total_orders: 0, period: yearString });
      }
    }
  }
  return filledData;
}

// Helper function to get week number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo.toString().padStart(2, '0');
}

// Main function to get revenue statistics
exports.getRevenueStatistics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let attributes, groupBy, orderBy;

    if (!startDate || !endDate) {
      return res.status(400).send('Missing startDate or endDate');
    }

    switch (period) {
      case 'day':
        attributes = [
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'period']
        ];
        groupBy = [sequelize.fn('DATE', sequelize.col('createdAt'))];
        orderBy = [sequelize.fn('DATE', sequelize.col('createdAt'))];
        break;
      case 'week':
        const weekQuery = getWeekQuery();
        attributes = weekQuery.attributes;
        groupBy = weekQuery.group;
        orderBy = weekQuery.order;
        break;
      case 'month':
        attributes = [
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
          [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'period']
        ];
        groupBy = [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')];
        orderBy = [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')];
        break;
      case 'year':
        attributes = [
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
          [sequelize.fn('YEAR', sequelize.col('createdAt')), 'period']
        ];
        groupBy = [sequelize.fn('YEAR', sequelize.col('createdAt'))];
        orderBy = [sequelize.fn('YEAR', sequelize.col('createdAt'))];
        break;
      default:
        return res.status(400).send('Invalid period');
    }

    const revenueData = await Order.findAll({
      attributes: attributes,
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      group: groupBy,
      order: orderBy
    });

    const formattedData = revenueData.map(item => ({
      total_revenue: item.getDataValue('total_revenue'),
      total_orders: item.getDataValue('total_orders'),
      period: item.getDataValue('period')
    }));

    const filledData = fillMissingDates(formattedData, period, startDate, endDate);

    res.status(200).json(filledData);
  } catch (err) {
    console.error(err);
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
      where: {
        status: {
          [Op.ne]: 'cancelled'
        }
      },
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
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['product_name']
        },
        {
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            status: {
              [Op.ne]: 'cancelled'
            }
          }
        }
      ],
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
      include: [{
        model: Order,
        as: 'orders',
        attributes: [],
        where: {
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      }],
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
      where: {
        status: {
          [Op.ne]: 'cancelled'
        }
      },
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
    const productStats = await Product.findAll({
      attributes: [
        'product_id',
        'product_name',
        'quantity', // Số lượng tồn kho
        [sequelize.fn('SUM', sequelize.literal('orderItems.quantity * orderItems.price')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'total_sold']
      ],
      include: [{
        model: OrderItem,
        as: 'orderItems',
        attributes: [],
        include: [{
          model: Order,
          as: 'order',
          attributes: [],
          where: {
            status: {
              [Op.ne]: 'cancelled'
            }
          }
        }]
      }],
      group: ['Product.product_id', 'Product.product_name', 'Product.quantity'],
      order: [[sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'DESC']]
    });

    console.log('Product Stats:', productStats);

    const totalStats = await OrderItem.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.literal('quantity * price')), 'total_revenue']
      ],
      include: [{
        model: Order,
        as: 'order',
        attributes: [],
        where: {
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      }]
    });

    console.log('Total Stats:', totalStats);

    res.status(200).json({
      productStats,
      totalStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
