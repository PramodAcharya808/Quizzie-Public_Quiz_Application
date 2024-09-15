import mongoose from "mongoose";
import { OPT1, OPT2, OPT3, T1, T2, T3, QNA } from "../constants.js";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    questionText: {
      type: String,
      required: [true, "Question required"],
    },
    optionType: {
      type: String,
      default: OPT1,
      enum: [OPT1, OPT2, OPT3],
      required: true,
    },
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
      },
    ],
    timer: {
      type: Number,
      required: function () {
        return this.quizType === QNA;
      },
      default: 0,
    },
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
