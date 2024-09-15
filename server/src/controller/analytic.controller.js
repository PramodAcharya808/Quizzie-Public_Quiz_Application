import { Quiz } from "../models/quiz.model.js";
import { Question } from "../models/question.model.js";
import { Response } from "../models/response.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const quizImpressionIncrease = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiResponse(404, "No quiz found");
    }

    quiz.impressions += 1;
    await quiz.save();

    return res.json(new ApiResponse(200, "Quiz impression incremented"));
  } catch (error) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while incrementing quiz impression",
        error
      )
    );
  }
};

const totalImpressions = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Quiz.aggregate([
      {
        $match: { creatorId: userId },
      },
      {
        $group: {
          _id: null, // Aggregate over all documents
          totalImpressions: { $sum: "$impressions" }, // Sum the 'impressions' field
        },
      },
    ]);

    if (result.length == 0) {
      return res.json(new ApiResponse(200, "Total Quiz Impressions", 0));
    }

    return res.json(
      new ApiResponse(200, "Total quiz impressions", result[0].totalImpressions)
    );
  } catch (error) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while fetching total quiz impressions",
        error
      )
    );
  }
};

const totalQuestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Quiz.aggregate([
      {
        $match: { creatorId: userId },
      },
      {
        $unwind: "$questions",
      },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json(new ApiResponse(200, "Total Quiz Questions", 0));
    }

    return res.json(
      new ApiResponse(200, "Total Quiz Questions", result[0].totalQuestions)
    );
  } catch (error) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while fetching total questions",
        error
      )
    );
  }
};

const trendingQuiz = async (req, res) => {
  try {
    const userId = req.user._id;

    // Filter quizzes with 10 or more impressions and created by the current user
    const result = await Quiz.find({
      creatorId: userId,
      impressions: { $gte: 10 },
    }).sort({ impressions: -1 });

    if (result.length === 0) {
      return res.json(new ApiResponse(200, "No trending quiz found", result));
    }

    return res.json(new ApiResponse(200, "Trending quiz", result));
  } catch (error) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while fetching trending quizzes",
        error
      )
    );
  }
};

const totalQuiz = async (req, res) => {
  try {
    const userQuizes = req.user.quizes;
    // console.log(userQuizes.length);

    return res.json(new ApiResponse(200, "Total Quiz", userQuizes.length));
  } catch (error) {
    return res.json(
      new ApiError(500, "Error while fetching total quiz", error)
    );
  }
};

const getQuestionWiseAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;
    // console.log(quizId);
    // console.log(userId);

    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question",
    });

    // console.log(quiz.creatorId);

    if (!quiz || quiz.creatorId.toString() !== userId.toString()) {
      throw new ApiResponse(403, "Unauthorized to view this quiz");
    }

    if (!quiz) {
      throw new ApiResponse(404, "Quiz not found");
    }

    // Aggregating responses to gather analytics
    const analytics = await Response.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.questionId",
          totalAnswered: { $sum: 1 },
          totalCorrect: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
          totalWrong: { $sum: { $cond: ["$answers.isCorrect", 0, 1] } },
        },
      },
    ]);

    // Map analytics data back to each question
    const questionAnalytics = quiz.questions.map((question) => {
      const analytic = analytics.find((a) => a._id.equals(question._id)) || {
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
      };
      return {
        questionText: question.questionText,
        totalAnswered: analytic.totalAnswered,
        totalCorrect: analytic.totalCorrect,
        totalWrong: analytic.totalWrong,
      };
    });

    const response = {
      quizName: quiz.quizName,
      questions: questionAnalytics,
      totalImpressions: quiz.impressions,
      createdAt: quiz.createdAt,
    };

    return res.json(
      new ApiResponse(
        200,
        "Question-wise analytics fetched successfully",
        response
      )
    );
  } catch (error) {
    console.error("Error fetching question-wise analytics:", error);
    return res.json(
      new ApiError(500, "Error fetching question-wise analytics", error)
    );
  }
};

const getPollAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question",
      populate: {
        path: "options",
        model: "Option",
      },
    });

    if (!quiz || quiz.creatorId.toString() !== userId.toString()) {
      throw new ApiResponse(403, "Unauthorized to view this quiz");
    }

    if (!quiz) {
      throw new ApiResponse(404, "Quiz not found");
    }

    const analytics = await Response.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      { $unwind: "$answers" },
      { $unwind: "$answers.selectedOptionId" },
      {
        $group: {
          _id: "$answers.selectedOptionId",
          totalSelected: { $sum: 1 },
        },
      },
    ]);

    // Map analytics data back to each question
    const questionAnalytics = quiz.questions.map((question) => {
      const optionsAnalytics = question.options.map((option) => {
        const analytic = analytics.find((a) => a._id.equals(option._id)) || {
          totalSelected: 0,
        };
        return {
          optionText: option.optionText,
          totalSelected: analytic.totalSelected,
        };
      });

      return {
        questionText: question.questionText,
        options: optionsAnalytics,
      };
    });

    const response = {
      quizName: quiz.quizName,
      questions: questionAnalytics,
      totalImpressions: quiz.impressions,
      createdAt: quiz.createdAt,
    };

    return res.json(
      new ApiResponse(
        200,
        "Poll question analytics fetched successfully",
        response
      )
    );
  } catch (error) {
    console.error("Error fetching poll question analytics:", error);
    return res.json(
      new ApiError(500, "Error fetching poll question analytics", error)
    );
  }
};

export {
  quizImpressionIncrease,
  totalImpressions,
  totalQuestions,
  trendingQuiz,
  totalQuiz,
  getQuestionWiseAnalytics,
  getPollAnalytics,
};
