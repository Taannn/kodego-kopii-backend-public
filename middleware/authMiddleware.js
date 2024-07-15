const jwt = require('jsonwebtoken');

// next so we can continue the flow again after this middleware is done authneticading and decoding the token too
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not provided" })
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Token not provided" });
  }
};

module.exports = authenticateUser;