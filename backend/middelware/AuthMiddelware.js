const JWT = require("jsonwebtoken");
const authMiddelware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authentication Required" });
    }
    const [schema, token] = authHeader.split(" ");
    if (schema !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid Authorization Format" });
    }
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invailid aur expired token" });
  }
};
module.exports = authMiddelware;
