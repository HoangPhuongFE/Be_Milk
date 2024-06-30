<<<<<<< HEAD
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
require('dotenv').config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL;
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

async function createPaymentUrl(orderId, amount, ipAddr) {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const txnRef = moment(date).format('HHmmss');
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const orderType = 'billpayment';
    const locale = 'vn';
    const currCode = 'VND';

    const vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': locale,
        'vnp_CurrCode': currCode,
        'vnp_TxnRef': txnRef,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': orderType,
        'vnp_Amount': (amount * 100).toString(),
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    sortedParams['vnp_SecureHash'] = signed;
    const paymentUrl = `${vnp_Url}?${querystring.stringify(sortedParams, { encode: false })}`;

    return paymentUrl;
}

exports.createPaymentUrl = async (req, res) => {
    try {
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);

        const { orderId, amount } = req.body;
        const paymentUrl = await createPaymentUrl(orderId, amount, ipAddr);

        res.status(200).json({ paymentUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.vnpayReturn = async (req, res) => {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        try {
            const order = await Order.findOne({ where: { order_id: orderId } });
            if (!order) {
                return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
            }

            if (responseCode === '00') {
                // Thanh toán thành công
                order.status = 'paid';
            } else {
                // Thanh toán thất bại
                order.status = 'failed';
            }

            await order.save();

            res.status(200).json({ RspCode: '00', Message: 'success' });
        } catch (err) {
            res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }
};

module.exports.createPaymentUrl = createPaymentUrl;
=======
const paypal = require('../config/paypalConfig');
const { Order, OrderItem, Product } = require('../models');

exports.createPayment = async (req, res) => {
  const { order_id } = req.body;
  console.log('Request Body:', req.body); // Log toàn bộ request body để kiểm tra
  console.log('Order ID:', order_id); // In ra để kiểm tra

  if (!order_id) {
    return res.status(400).send('Order ID is required');
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
      console.log('Order not found for ID:', order_id);
      return res.status(404).send('Order not found');
    }

    if (!order.items || order.items.length === 0) {
      console.log('No items found for order ID:', order_id);
      return res.status(404).send('No items found in the order');
    }

    // Kiểm tra và xử lý giảm giá
    const items = order.items.map(item => {
      const price = parseFloat(item.price).toFixed(2);
      const productName = item.product ? item.product.product_name : 'Unknown Product'; // Sử dụng product_name
      console.log(`Item: ${productName}, Quantity: ${item.quantity}, Price: ${price}`);
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

    console.log(`Calculated total: ${calculatedTotal}, Order total: ${orderTotal}`);

    // Kiểm tra nếu tổng số tiền của các mục khớp với tổng số tiền của đơn hàng
    if (parseFloat(calculatedTotal) !== parseFloat(orderTotal)) {
      console.log(`Mismatch detected: Calculated total ${calculatedTotal}, Order total ${orderTotal}`);
      // Điều chỉnh giá các mục sản phẩm để phản ánh giảm giá
      const discountFactor = parseFloat(orderTotal) / parseFloat(calculatedTotal);
      const adjustedItems = items.map(item => {
        item.price = (parseFloat(item.price) * discountFactor).toFixed(2);
        return item;
      });

      const adjustedTotal = adjustedItems.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
      }, 0).toFixed(2);

      console.log(`Adjusted total: ${adjustedTotal}, Order total: ${orderTotal}`);

      if (parseFloat(adjustedTotal) !== parseFloat(orderTotal)) {
        console.log(`Mismatch detected after adjustment: Adjusted total ${adjustedTotal}, Order total ${orderTotal}`);
        return res.status(400).send('Total amount mismatch after adjustment');
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
            "total": orderTotal, // Sử dụng tổng số tiền của đơn hàng
            "details": {
              "subtotal": orderTotal // Đảm bảo subtotal khớp với tổng số tiền
            }
          },
          "description": `Order ID: ${order.order_id}`
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.error('PayPal Error:', error.response);
          return res.status(500).send('Error creating PayPal payment');
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
            "total": orderTotal, // Sử dụng tổng số tiền của đơn hàng
            "details": {
              "subtotal": orderTotal // Đảm bảo subtotal khớp với tổng số tiền
            }
          },
          "description": `Order ID: ${order.order_id}`
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.error('PayPal Error:', error.response);
          return res.status(500).send('Error creating PayPal payment');
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === 'approval_url') {
              return res.status(201).json({ approval_url: payment.links[i].href });
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).send('Internal server error');
  }
};




exports.executePayment = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const { order_id } = req.query;

  try {
    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": order.total_amount.toFixed(2) // Sử dụng tổng số tiền từ đơn hàng
        }
      }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
      if (error) {
        console.error(error.response);
        return res.status(500).send('Payment failed');
      } else {
        order.status = 'completed';
        await order.save();
        res.send('Payment successful');
      }
    });
  } catch (error) {
    console.error('Error executing payment:', error);
    return res.status(500).send('Internal server error');
  }
};

exports.cancelPayment = async (req, res) => {
  const { order_id } = req.query;
  try {
    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    // Update the status to 'cancelled'
    order.status = 'pending';
    await order.save();
    res.send('Payment cancelled');
  } catch (error) {
    console.error('Error canceling payment:', error);
    return res.status(500).send('Internal server error');
  }
};
>>>>>>> 50b3931a78e4d92c2c0d3e093c1754bfbcd61e06
