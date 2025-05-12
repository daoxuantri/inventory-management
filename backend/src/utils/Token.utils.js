const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ApiError = require("./ApiError");

console.log("JWT_SECRET in Token.utils.js:", process.env.JWT_SECRET); // Log để debug

exports.validateToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "JWT_SECRET không được định nghĩa");
    }
    if (!token || typeof token !== "string" || !token.includes(".")) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token không đúng định dạng");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Validated token:", decoded);
    return decoded;
  } catch (err) {
    console.error("Token validation error:", err.message);
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token không hợp lệ");
    }
    if (err.name === "TokenExpiredError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token đã hết hạn");
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, "Lỗi xác thực token");
  }
};

exports.generatoken = (user, expiresIn = "1d") => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "JWT_SECRET không được định nghĩa");
  }
  const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, { expiresIn });
  console.log("Generated token:", token);
  return token;
};