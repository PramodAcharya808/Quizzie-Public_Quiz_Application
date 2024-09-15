import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JWTverify = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiResponse(401, "Access Restricted");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new ApiResponse(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiError(401, "Invalid authorization", error));
  }
};

export { JWTverify };
