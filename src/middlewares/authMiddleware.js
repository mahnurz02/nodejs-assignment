const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_JWT_KEY;

// Middle ware for jwtauth

const authenticateToken = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. Token is missing.' });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    const { id, username, email } = decodedToken;
    req.user = { id, username, email };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Access denied. Invalid token.' });
  }
};

module.exports = authenticateToken;
