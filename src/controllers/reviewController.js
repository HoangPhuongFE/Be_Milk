const { Review } = require('../models');

exports.createReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const review = await Review.create({
      product_id,
      rating,
      comment,
      user_id
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const reviews = await Review.findAll({ where: { product_id } });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  const { review_id } = req.params;

  try {
    const review = await Review.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  const { review_id } = req.params;
  const { rating, comment } = req.body;
  const user_id = req.user?.id;

  try {
    const review = await Review.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    if (review.user_id !== user_id && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Bạn không được phép chỉnh sửa đánh giá này.' });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  const { review_id } = req.params;
  const user_id = req.user.user_id;

  try {
    const review = await Review.findByPk(review_id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== user_id && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'You are not allowed to delete this review.' });
    }

    await review.destroy();
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
