// controllers/paymentController.js

const paypal = require('../config/paypalConfig');
const { Order, OrderItem, Product } = require('../models');

exports.createPayment = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).send('Order ID là bắt buộc');
  }

  try {
    const order = await Order.findByPk(order_id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }]
    });

    if (!order) {
      return res.status(404).send('Không tìm thấy đơn hàng');
    }

    if (order.payment_method === 'cod') {
      // Xử lý thanh toán khi nhận hàng
      order.status = 'pending';
      await order.save();
      return res.status(201).send('Đơn hàng đang chờ xác nhận thanh toán khi nhận hàng');
    } else if (order.payment_method === 'paypal') {
      // Xử lý thanh toán qua PayPal
      const items = order.items.map(item => {
        const price = parseFloat(item.price).toFixed(2);
        const productName = item.product ? item.product.product_name : 'Sản phẩm không xác định';
        return {
          "name": productName,
          "sku": item.product_id.toString(),
          "price": price,
          "currency": "USD",
          "quantity": item.quantity
        };
      });

      const calculatedTotal = items.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
      }, 0).toFixed(2);

      const orderTotal = parseFloat(order.total_amount).toFixed(2);

      if (parseFloat(calculatedTotal) !== parseFloat(orderTotal)) {
        const discountFactor = parseFloat(orderTotal) / parseFloat(calculatedTotal);
        const adjustedItems = items.map(item => {
          item.price = (parseFloat(item.price) * discountFactor).toFixed(2);
          return item;
        });

        const adjustedTotal = adjustedItems.reduce((total, item) => {
          return total + (parseFloat(item.price) * item.quantity);
        }, 0).toFixed(2);

        if (parseFloat(adjustedTotal) !== parseFloat(orderTotal)) {
          return res.status(400).send('Chênh lệch tổng số tiền sau điều chỉnh');
        }

        const create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": `http://localhost:5000/api/payment/success?order_id=${order.order_id}`,
            "cancel_url": `http://localhost:5000/api/payment/cancel?order_id=${order.order_id}`
          },
          "transactions": [{
            "item_list": {
              "items": adjustedItems
            },
            "amount": {
              "currency": "USD",
              "total": orderTotal,
              "details": {
                "subtotal": orderTotal
              }
            },
            "description": `Order ID: ${order.order_id}`
          }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            return res.status(500).send('Lỗi tạo thanh toán PayPal');
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                return res.status(201).json({ approval_url: payment.links[i].href });
              }
            }
          }
        });
      } else {
        const create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": `http://localhost:5000/api/payment/success?order_id=${order.order_id}`,
            "cancel_url": `http://localhost:5000/api/payment/cancel?order_id=${order.order_id}`
          },
          "transactions": [{
            "item_list": {
              "items": items
            },
            "amount": {
              "currency": "USD",
              "total": orderTotal,
              "details": {
                "subtotal": orderTotal
              }
            },
            "description": `Order ID: ${order.order_id}`
          }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            return res.status(500).send('Lỗi tạo thanh toán PayPal');
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                return res.status(201).json({ approval_url: payment.links[i].href });
              }
            }
          }
        });
      }
    } else {
      return res.status(400).send('Phương thức thanh toán không hợp lệ');
    }
  } catch (error) {
    return res.status(500).send('Lỗi máy chủ nội bộ');
  }
};


exports.executePayment = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const { order_id } = req.query;

  try {
    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).send('Không tìm thấy đơn hàng');
    }

    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": order.total_amount.toFixed(2)
        }
      }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
      order.status = 'pending';
      await order.save();
      if (error) {
        console.error(error.response);
      } else {
        console.log('Thanh toán thành công:', payment);
      }
      return res.redirect(`/profile`);
    });
  } catch (error) {
    console.error('Lỗi thực hiện thanh toán:', error);
    return res.status(500).send('Lỗi máy chủ nội bộ');
  }
};

exports.cancelPayment = async (req, res) => {
  const { order_id } = req.query;
  try {
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).send('Không tìm thấy đơn hàng');
    }
    order.status = 'pending';
    await order.save();
    res.redirect(`/profile`);
  } catch (error) {
    console.error('Lỗi hủy thanh toán:', error);
    return res.status(500).send('Lỗi máy chủ nội bộ');
  }
};
