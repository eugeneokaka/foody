const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.log("unothosrisesd");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  jwt.verify(token, process.env.SECRETE, (err, user) => {
    if (err) {
      return res.status(403).json({ mess: "Token is not valid" });
    }
    req.user = user;
    next();
  });
}
module.exports = authenticateToken;
