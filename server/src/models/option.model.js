import mongoose from "mongoose";
import { QNA } from "../constants.js";

const optionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    optionText: {
      type: String,
      // required: true,
    },
    imageURL: {
      type: String,
    },
    isCorrect: {
      type: Boolean,
      default: false,
      required: function () {
        return this.quizType === QNA;
      },
    },
  },
  { timestamps: true }
);

export const Option = mongoose.model("Option", optionSchema);
