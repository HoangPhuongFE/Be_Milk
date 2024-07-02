const { PaymentMethod } = require('../models');

exports.createPaymentMethod = async (req, res) => {
  const { method_name } = req.body;

  try {
    const paymentMethod = await PaymentMethod.create({
    method_name  
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findAll();
    res.status(200).json(paymentMethods);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  const { method_id } = req.params;
  const { method_name } = req.body;

  try {
    const paymentMethod = await PaymentMethod.findByPk(method_id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    paymentMethod.method_name = method_name;
    await paymentMethod.save();

    res.status(200).json(paymentMethod);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  const { method_id } = req.params;

  try {
    const paymentMethod = await PaymentMethod.findByPk(method_id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await paymentMethod.destroy();
    res.status(200).json({ message: 'Payment method deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
