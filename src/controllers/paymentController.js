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
