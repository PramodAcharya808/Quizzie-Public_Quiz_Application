import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    sessionId: {
      type: String,
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedOptionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Option",
        },
        selectedOptionText: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      totalCorrect: {
        type: Number,
        default: 0,
      },
      totalQuestions: {
        type: Number,
        default: 0,
      },
      totalWrong: {
        type: Number,
        default: 0,
      },
    },
  },

  {
    timestamps: true,
  }
);

export const Response = mongoose.model("Response", responseSchema);
