const { Op } = require('sequelize');
const { Voucher } = require('../models');

exports.createVoucher = async (req, res) => {
  const { code, discount, discount_type, expiration_date } = req.body;

  try {
    const voucher = await Voucher.create({
      code,
      discount,
      discount_type,
      expiration_date
    });

    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll();
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getVoucherById = async (req, res) => {
  const { voucher_id } = req.params;

  try {
    const voucher = await Voucher.findByPk(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    res.status(200).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const { code, discount, discount_type, expiration_date } = req.body;
    const voucher = await Voucher.findByPk(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    voucher.code = code;
    voucher.discount = discount;
    voucher.discount_type = discount_type;
    voucher.expiration_date = expiration_date;

    await voucher.save();

    res.status(200).json(voucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  const { voucher_id } = req.params;

  try {
    const voucher = await Voucher.findByPk(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    await voucher.destroy();

    res.status(204).json({ message: 'Voucher deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.applyVoucher = async (req, res) => {
  const { code } = req.body;

  try {
    const voucher = await Voucher.findOne({
      where: { code, expiration_date: { [Op.gt]: new Date() } }
    });
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found or expired' });
    }

    // Logic to apply the voucher to the user's order or cart
    // ...

    res.status(200).json({ message: 'Voucher applied successfully', discount: voucher.discount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
