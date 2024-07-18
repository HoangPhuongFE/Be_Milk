const e = require('express');
const { Product } = require('../models');
// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const {
      category_id,
      product_name,
      description,
      quantity,
      price,
      image_url,
      status,
      age,
      weight,
      placeOfProduction,
      warranty,
      brandOfOrigin,
      numberOfSale,
      ingredient,
      userManual,
      outstandingFeatures
    } = req.body;
    const productStatus = quantity === 0 ? 'out_of_stock' : status || 'available';
    const product = await Product.create({
      category_id,
      product_name,
      description,
      quantity,
      price,
      image_url,
      status,
      age,
      weight,
      placeOfProduction,
      warranty,
      brandOfOrigin,
      numberOfSale,
      ingredient,
      userManual,
      outstandingFeatures
    });
    res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: err.message });
  }
};

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy thông tin chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const {
      category_id,
      product_name,
      description,
      quantity,
      price,
      image_url,
      status,
      age,
      weight,
      placeOfProduction,
      warranty,
      brandOfOrigin,
      numberOfSale,
      ingredient,
      userManual,
      outstandingFeatures
    } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.category_id = category_id || product.category_id;
    product.product_name = product_name || product.product_name;
    product.description = description || product.description;
    product.quantity = quantity   || product.quantity ;
    product.price = price || product.price;
    product.image_url = image_url   || product.image_url;
    product.status = status || product.status;
    product.age = age || product.age;
    product.weight = weight || product.weight;
    product.placeOfProduction = placeOfProduction || product.placeOfProduction;
    product.warranty = warranty || product.warranty;
    product.brandOfOrigin = brandOfOrigin || product.brandOfOrigin;
    product.numberOfSale = numberOfSale || product.numberOfSale;
    product.ingredient = ingredient || product.ingredient;
    product.outstandingFeatures = outstandingFeatures || product.outstandingFeatures;
    product.userManual = userManual || product.userManual;
    await product.save();
    res.status(200).json(product);
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { product_id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
