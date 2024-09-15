import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// mongodb connection
const dbconnect = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Mongodb connection established");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default dbconnect;
