import mongoose from "mongoose";
import { QNA, POLL } from "../constants.js";

const quizSchema = new mongoose.Schema(
  {
    quizName: {
      type: String,
      required: [true, "Quiz name required"],
    },
    quizType: {
      type: String,
      required: [true, "Quiz type required"],
      enum: [QNA, POLL],
      default: QNA,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    impressions: {
      type: Number,
      default: 0,
    },
    quizLink: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
