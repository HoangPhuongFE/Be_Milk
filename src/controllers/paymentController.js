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
        console.error('Lỗi tạo thanh toán PayPal:', error);
        return res.status(500).send('Lỗi tạo thanh toán PayPal');
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            return res.status(201).json({ approval_url: payment.links[i].href });
          }
        }
        return res.status(400).send('Không tìm thấy URL phê duyệt PayPal');
      }
    });
  } catch (error) {
    console.error('Lỗi máy chủ nội bộ:', error);
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
      if (error) {
        console.error('Lỗi thực hiện thanh toán:', error.response);
        return res.status(500).send('Lỗi thực hiện thanh toán');
      } else {
        order.status = 'completed';
        await order.save();
        console.log('Thanh toán thành công:', payment);
        return res.redirect(`http://localhost:5173/profile`);
      }
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
