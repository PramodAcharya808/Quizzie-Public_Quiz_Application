import { Quiz } from "../models/quiz.model.js";
import { Response } from "../models/response.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Question } from "./../models/question.model.js";
import { Option } from "./../models/option.model.js";

const getQuizData = async (req, res) => {
  try {
    const { quizLink } = req.params;
    // console.log(quizLink);
    const quizObject = await Quiz.findOne({ quizLink })
      .populate({
        path: "questions",
        model: "Question",
        populate: {
          path: "options",
          model: "Option",
          select: "-isCorrect -updatedAt -createdAt",
        },
      })
      .select("-creatorId");

    if (!quizObject) {
      throw new ApiResponse(404, "Quiz not found");
    }

    return res.json(
      new ApiResponse(200, "Quiz data fetched successfully", quizObject)
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error. Quiz not found", error));
  }
};

const getResponse = async (req, res) => {
  const { quizId, questionId, selectedOptionId, sessionId } = req.body;

  try {
    let isCorrect = false; // Default to false if selectedOptionId is not provided

    // Find the question based on questionId
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiResponse(404, "Question not found");
    }

    if (selectedOptionId) {
      const option = await Option.findById(selectedOptionId);

      if (option) {
        isCorrect = option.isCorrect;
      }
      // If option is not found, isCorrect remains false
    }

    // Find the response for the quiz based on sessionId and quizId
    let response = await Response.findOne({ quizId, sessionId });

    if (!response) {
      response = new Response({
        quizId,
        sessionId,
        answers: [],
        score: { totalCorrect: 0, totalQuestions: 0, totalWrong: 0 },
      });
    }

    // Prevent duplicate answers for the same question
    if (
      response.answers.some((answer) => answer.questionId.equals(questionId))
    ) {
      throw new ApiResponse(400, "Question already answered");
    }

    // Add the new answer
    response.answers.push({
      questionId,
      selectedOptionId: selectedOptionId || null, // Save null if no option was selected
      isCorrect,
    });

    // Update the score
    response.score.totalQuestions += 1;
    if (isCorrect) {
      response.score.totalCorrect += 1;
    }
    if (!isCorrect) {
      response.score.totalWrong += 1;
    }

    await response.save();

    return res.json(
      new ApiResponse(200, "Answer sumbitted successfully", response.score)
    );
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.json(new ApiError(500, "Error submitting answer", error));
  }
};

export { getQuizData, getResponse };
