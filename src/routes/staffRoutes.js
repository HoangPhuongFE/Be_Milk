const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

router.get('/dashboard', authenticateToken, authorizeRole(['staff']), (req, res) => {
  res.status(200).json({ message: 'Welcome to the staff dashboard' });
});

module.exports = router;
