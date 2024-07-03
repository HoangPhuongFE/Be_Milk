const { Category } = require('../models');

// Tạo danh mục mới 
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    // Kiểm tra xem danh mục đã tồn tại chưa
    const categoryExist = await Category.findOne({ where: { name } });
    if (categoryExist) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy danh sách danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy thông tin chi tiết danh mục
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật danh mục theo id
exports.updateCategory = async (req, res) => {
  try {
    const {name} = req.body;
    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({ where: { name, category_id: { [Op.ne]: req.params.id } } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    const [updated] = await Category.update(req.body, {
      where: { category_id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa danh mục 
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { category_id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
