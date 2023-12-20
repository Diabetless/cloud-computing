require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_KEY;

const getToken = (headers) => {
  const authorizationHeader = headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      return (authorizationHeader.substring(7));
  }
  else {
      const error = new Error("You need to login");
      error.status = 401;
      throw error;
  }
}

const userVerification = async(req,res,next)=>{
  try {
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtKey);
    req.decoded = decoded;
    next();
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = userVerification;