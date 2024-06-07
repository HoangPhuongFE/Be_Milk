const { Cart, CartItem, Product } = require('../models');

exports.addItemToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const user_id = req.user.id;

  try {
    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    let cartItem = await CartItem.findOne({ where: { cart_id: cart.cart_id, product_id } });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cart_id: cart.cart_id, product_id, quantity });
    }

    res.status(201).json(cartItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCart = async (req, res) => {
  const user_id = req.user.id;

  try {
    const cart = await Cart.findOne({
      where: { user_id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { cart_item_id, quantity } = req.body;

  try {
    let cartItem = await CartItem.findByPk(cart_item_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { cart_item_id } = req.params;

  try {
    const cartItem = await CartItem.findByPk(cart_item_id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await cartItem.destroy();

    res.status(204).json({ message: 'Cart item removed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
