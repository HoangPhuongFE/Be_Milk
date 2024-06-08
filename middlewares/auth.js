const jwt = require('jsonwebtoken');

// Middleware để xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
  
    req.user=verified
   
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
