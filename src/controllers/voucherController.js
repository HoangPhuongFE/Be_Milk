const { Op } = require('sequelize');
const { Voucher , UserVoucher, User} = require('../models');

exports.createVoucher = async (req, res) => {
  const { code, discount, discount_type, expiration_date, minimum_order_value } = req.body;
//
  try {
    const voucher = await Voucher.create({
      code,
      discount,
      discount_type,
      expiration_date,
      minimum_order_value
    });

    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      include: {
        model: UserVoucher,
        as: 'userVouchers',
        include: {
          model: User,
          as: 'user'
        }
      }
    });
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
    const { code, discount, discount_type, expiration_date, minimum_order_value } = req.body;
    const voucher = await Voucher.findByPk(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    voucher.code = code;
    voucher.discount = discount;
    voucher.discount_type = discount_type;
    voucher.expiration_date = expiration_date;
    voucher.minimum_order_value = minimum_order_value;

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
  const user_id = req.user.id;

  try {
    const voucher = await Voucher.findOne({
      where: {
        code: code,
        expiration_date: { [Op.gt]: new Date() }
      }
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

    await UserVoucher.create({
      user_id: user_id,
      voucher_id: voucher.voucher_id,
      used: true
    });

    res.status(200).json({ message: 'Voucher applied successfully', discount: voucher.discount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
