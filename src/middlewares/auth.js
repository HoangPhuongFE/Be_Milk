const jwt = require('jsonwebtoken');


// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader); // Debug statement

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted Token:', token); // Debug statement

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified Token:', verified); // Debug statement

    req.user = verified;
    next();
  } catch (err) {
    console.log('Invalid token:', err); // Debug statement
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = { authenticateToken };


// Middleware để kiểm tra vai trò người dùng
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access Denied: You do not have the right permissions!' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
