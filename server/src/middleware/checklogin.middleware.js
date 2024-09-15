import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkAlreadyLoggedIn = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(); // No token, continue to the login process
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("Token is valid, user is already logged in:", decoded);
    return res.status(400).json(new ApiResponse(400, "Already logged in"));
  } catch (error) {
    // console.log("Token verification error:", error.message);
    next();
  }
};

export default checkAlreadyLoggedIn;
