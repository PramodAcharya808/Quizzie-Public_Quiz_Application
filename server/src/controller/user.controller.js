import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const userSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (
      [name, email, password, confirmPassword].some((fields) => {
        return fields?.trim() === "";
      })
    ) {
      throw new ApiResponse(400, "All fields are required");
    }

    if (password.length < 6) {
      throw new ApiResponse(
        400,
        "Password should be at least 6 characters long"
      );
    }

    if (password.length > 24) {
      throw new ApiResponse(
        400,
        "Password should not be more than 24 characters long"
      );
    }

    if (password !== confirmPassword) {
      throw new ApiResponse(400, "Passwords do not match");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiResponse(400, "Email already in use");
    }

    const userObject = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const userCreate = await User.findById(userObject._id).select("-password");

    if (!userCreate) {
      throw new ApiResponse(500, "Error while creating user");
    }

    const accessToken = userCreate.generateAccessToken();

    return res.status(201).json(
      new ApiResponse(201, "User created successfully", {
        user: userCreate,
        accessToken,
      })
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error while creating user", error));
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      [email, password].some((fields) => {
        return fields?.trim() === "";
      })
    ) {
      throw new ApiResponse(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiResponse(404, "User not found");
    }

    const passCheck = await user.isPasswordCorrect(password);
    if (!passCheck) {
      throw new ApiResponse(401, "Incorrect password");
    }

    const accessToken = user.generateAccessToken();

    const loginUserObject = await User.findById(user._id).select("-password");

    return res.status(200).json(
      new ApiResponse(200, "User Logged in successfully", {
        user: loginUserObject,
        accessToken,
      })
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error logging in", error));
  }
};

const userLogout = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
};

const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      throw new ApiResponse(404, "User not found");
    }
    return res.json(new ApiResponse(200, "Current Logged-in user", user));
  } catch (error) {
    return res.json(new ApiError(500, "Please login first"));
  }
};

export { userSignup, userLogin, userLogout, currentUser };
