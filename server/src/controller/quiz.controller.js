import { Quiz } from "../models/quiz.model.js";
import { Question } from "./../models/question.model.js";
import { Option } from "./../models/option.model.js";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { QNA } from "../constants.js";
import { User } from "../models/user.model.js";

const quizUuid = () => {
  const uuid = uuidv4();
  const publicLink = uuid;
  return { publicLink };
};

const createQuiz = async (req, res) => {
  try {
    const { quizName, quizType, questions } = req.body;
    const creatorId = req.user._id;
    const { publicLink } = quizUuid();

    const questionIds = [];
    const optionIds = [];

    // console.log(quizName, quizType, questions);

    if (quizName === "") {
      throw new ApiResponse(400, "Quiz name is required");
    }
    // Create Quiz Data
    const quizObject = await Quiz.create({
      quizName,
      quizType,
      creatorId,
      questions: [],
      quizLink: publicLink,
    });

    // Create Question Data
    for (const questionData of questions) {
      const { questionText, optionType, options, timer } = questionData;
      const questionObject = await Question.create({
        quizId: quizObject._id,
        questionText,
        optionType,
        options: [],
        timer: quizType === QNA ? timer : undefined,
      });

      questionIds.push(questionObject._id);
      quizObject.questions = questionIds;
      await quizObject.save();

      // Create Option Data
      for (const optionData of options) {
        const { optionText, imageURL, isCorrect } = optionData;
        const optionObject = await Option.create({
          questionId: questionObject._id,
          optionText,
          imageURL,
          isCorrect,
        });

        optionIds.push(optionObject._id);
        questionObject.options.push(optionObject._id);
        await questionObject.save();
      }
    }

    await User.findByIdAndUpdate(creatorId, {
      $push: { quizes: quizObject._id },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Quiz Created Successfully",
        // publicLink,
        quizObject
      )
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error creating quiz", error));
  }
};

// const updateQuiz = async (req, res) => {
//   try {
//     const { questionText, options, timer } = req.body;
//     const { quizId, questionId } = req.params;
//     const userId = req.user._id;

//     // Validate User
//     const userIsQuizCreator = await Quiz.exists({
//       _id: quizId,
//       creatorId: userId,
//     });
//     if (!userIsQuizCreator) {
//       throw new ApiResponse(403, "Your not authorized to edit this quiz");
//     }

//     const quizExists = await Quiz.exists({ _id: quizId });
//     if (!quizExists) {
//       throw new ApiResponse(404, "Quiz not found");
//     }

//     if (timer !== 0 && timer !== 5 && timer !== 10) {
//       throw new ApiResponse(
//         400,
//         "Invalid timer value. Timer should be either 0, 5, or 10 seconds"
//       );
//     }

//     // Validate Question ID
//     const questionExists = await Question.exists({
//       _id: questionId,
//       quizId: quizId,
//     });
//     if (!questionExists) {
//       throw new ApiResponse(404, "Question not found in the specified quiz");
//     }

//     if (questionText || timer !== undefined) {
//       await Question.findByIdAndUpdate(questionId, {
//         ...(questionText && { questionText }),
//         ...(timer !== undefined && { timer }),
//       });
//     }

//     if (options && options.length) {
//       options.forEach(async (option) => {
//         await Option.findByIdAndUpdate(option.optionId, {
//           ...(option.optionText && { optionText: option.optionText }),
//         });
//       });
//     }

//     const quizObject = await Quiz.findById(quizId).populate({
//       path: "questions",
//       model: "Question",
//       populate: {
//         path: "options",
//         model: "Option",
//       },
//     });

//     return res.json(
//       new ApiResponse(200, "Quiz Updated Successfully", quizObject)
//     );
//   } catch (error) {
//     return res.json(new ApiError(500, "Error updating quiz", error));
//   }
// };

const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    // Find the existing quiz
    const quizObject = await Quiz.findById(quizId);
    if (!quizObject) {
      throw new ApiError(404, "Quiz not found");
    }

    // Update each question
    for (const questionData of questions) {
      const { questionId, questionText, options, timer } = questionData;

      // Find the existing question
      const questionObject = await Question.findById(questionId);
      if (
        !questionObject ||
        String(questionObject.quizId) !== String(quizObject._id)
      ) {
        throw new ApiError(
          404,
          `Question with ID ${questionId} not found in this quiz`
        );
      }

      // Update the question text if provided
      if (questionText !== undefined) {
        questionObject.questionText = questionText;
      }
      if (timer !== undefined) {
        questionObject.timer = timer;
      }

      // Update each option
      for (const optionData of options) {
        const { optionId, optionText, imageURL, isCorrect } = optionData;

        // Find the existing option
        const optionObject = await Option.findById(optionId);
        if (
          !optionObject ||
          String(optionObject.questionId) !== String(questionObject._id)
        ) {
          throw new ApiError(
            404,
            `Option with ID ${optionId} not found in this question`
          );
        }

        // Update the option fields if provided
        if (optionText !== undefined) {
          optionObject.optionText = optionText;
        }
        if (imageURL !== undefined) {
          optionObject.imageURL = imageURL;
        }
        if (isCorrect !== undefined) {
          optionObject.isCorrect = isCorrect;
        }

        // Save the updated option
        await optionObject.save();
      }

      // Save the updated question
      await questionObject.save();
    }

    // Return the updated quiz object
    const updatedQuiz = await Quiz.findById(quizId).populate({
      path: "questions",
      populate: {
        path: "options",
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Quiz Updated Successfully", updatedQuiz));
  } catch (error) {
    return res.json(new ApiError(500, "Error updating quiz", error));
  }
};

const getQuizData = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quizObject = await Quiz.findById(quizId)
      .populate({
        path: "creatorId",
        model: "User",
        select: "_id name email",
      })
      .populate({
        path: "questions",
        model: "Question",
        populate: {
          path: "options",
          model: "Option",
        },
      });

    if (!quizObject) {
      throw new ApiResponse(404, "Quiz not found");
    }

    if (quizObject.creatorId._id.toString() !== userId.toString()) {
      throw new ApiResponse(403, "You are not authorized to view this quiz");
    }

    return res.json(
      new ApiResponse(200, "Quiz Data Fetched Successfully", quizObject)
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error while fetching data", error));
  }
};

const getAllQuiz = async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({ creatorId: userId });

    return res.json(new ApiResponse(200, "All quiz", quizzes));
  } catch (error) {
    return res.json(new ApiError(500, "Error while fetching quizes", error));
  }
};

const getQuizLink = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    // console.log(quiz);

    if (!quiz) {
      throw new ApiResponse(404, "Quiz not found");
    }
    if (quiz.creatorId.toString() !== userId.toString()) {
      throw new ApiResponse(
        403,
        "You are not authorized to get this quiz link"
      );
    }
    return res.json(
      new ApiResponse(200, "Quiz Link Fetched Successfully", quiz.quizLink)
    );
  } catch (error) {
    return res.json(new ApiError(500, "Error fetching quiz link", error));
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;
    // console.log(quizId);

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new ApiResponse(404, "Quiz not found");
    }
    if (quiz.creatorId.toString() !== userId.toString()) {
      throw new ApiResponse(403, "You are not authorized to delete this quiz");
    }

    // Delete options linked to the questions of the quiz
    const questions = await Question.find({ quizId: quiz._id });
    const questionIds = questions.map((question) => question._id);

    await Option.deleteMany({ questionId: { $in: questionIds } });

    // Delete questions
    await Question.deleteMany({ quizId: quiz._id });

    // Finally, delete the quiz itself
    await Quiz.deleteOne({ _id: quizId });

    // Remove quiz from user's quizzes array
    await User.findByIdAndUpdate(userId, {
      $pull: { quizes: quizId },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Quiz Deleted Successfully"));
  } catch (error) {
    return res.json(new ApiError(500, "Error deleting quiz", error));
  }
};

export {
  createQuiz,
  deleteQuiz,
  getQuizData,
  updateQuiz,
  getQuizLink,
  getAllQuiz,
};
