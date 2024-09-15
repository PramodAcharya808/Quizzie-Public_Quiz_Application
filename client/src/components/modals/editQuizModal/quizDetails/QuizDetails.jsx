import React, { useEffect, useState } from "react";
import "./QuizDetails.css";
import toastr from "toastr";
import { Delete } from "../../../Icons/CustomIcons";
import axios from "axios";
import CopyLinkModal from "../copyLinkModal/CopyLinkModal";
import { useAuth } from "../../../../context/AuthContext";
import Loader from "./../../../loader/Loader";
import apiClient from "./../../../../utils/apiClient";

const QuizDetails = ({
  setShow,
  setNext,
  resetForm1,
  quizInfo,
  setQuizInfo,
  setSelectedType,
  quizId, // Added quizId prop to identify the quiz being edited
}) => {
  const handleCancel = () => {
    setShow(false);
    setNext(false);
    resetForm1();
    setQuizInfo({});
    setSelectedType(null);
  };

  const { loading, setLoadingState } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptionTypes, setSelectedOptionTypes] = useState([]);
  const [questionTimers, setQuestionTimers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [created, setCreated] = useState(false);
  const [quizLink, setQuizLink] = useState("");

  // Fetching quiz data
  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoadingState(true);
        const response = await apiClient.get(`/quiz/view/${quizId}`);
        const quizData = response.data.data;
        setLoadingState(false);

        // Populate state with quiz data, including IDs
        setQuestions(
          quizData.questions.map((question) => ({
            _id: question._id, // Store question ID
            text: question.questionText,
            options: question.options.map((option) => ({
              _id: option._id, // Store option ID
              text: option.optionText,
              imageURL: option.imageURL, // Correctly populate the imageURL field
            })),
          }))
        );
        setSelectedOptionTypes(
          quizData.questions.map((question) => question.optionType)
        );
        setQuestionTimers(
          quizData.questions.map((question) =>
            question.timer === 0 ? "OFF" : `${question.timer} sec`
          )
        );
        setCorrectAnswers(
          quizData.questions.map((question) =>
            question.options.findIndex((option) => option.isCorrect)
          )
        );
      } catch (error) {
        console.error("Error fetching quiz data", error);
        toastr.error("Failed to fetch quiz data");
      }
    }

    fetchQuizData();
  }, [quizId]);

  const handleQuestionChange = (e, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = e.target.value;
    setQuestions(updatedQuestions);
  };

  // const handleOptionChange = (e, questionIndex, optionIndex) => {
  //   const updatedQuestions = [...questions];
  //   updatedQuestions[questionIndex].options[optionIndex].imageURL =
  //     e.target.value;
  //   setQuestions(updatedQuestions);
  // };

  const handleOptionTextChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].text = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleOptionImageURLChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex].imageURL =
      e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleTimerChange = (questionIndex, timerValue) => {
    const updatedTimers = [...questionTimers];
    updatedTimers[questionIndex] = timerValue;
    setQuestionTimers(updatedTimers);
  };
  const validateForm = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toastr.error(`Question ${i + 1} is required.`);
        return false;
      }

      for (let j = 0; j < questions[i].options.length; j++) {
        const optionType = selectedOptionTypes[i]; // Get the option type for the current question
        const option = questions[i].options[j];

        if (optionType === "Text" && !option.text.trim()) {
          toastr.error(
            `Text for Option ${j + 1} in Question ${i + 1} is required.`
          );
          return false;
        }

        if (optionType === "Image URL" && !option.imageURL.trim()) {
          toastr.error(
            `Image URL for Option ${j + 1} in Question ${i + 1} is required.`
          );
          return false;
        }

        if (optionType === "Text and Image URL") {
          if (!option.text.trim()) {
            toastr.error(
              `Text for Option ${j + 1} in Question ${i + 1} is required.`
            );
            return false;
          }
          if (!option.imageURL.trim()) {
            toastr.error(
              `Image URL for Option ${j + 1} in Question ${i + 1} is required.`
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleUpdateQuiz = async () => {
    if (!validateForm()) {
      return;
    }

    // Ensure that questionId and optionId are included
    const updatedQuizData = {
      questions: questions.map((question, index) => ({
        questionId: question._id, // Use the stored question ID
        questionText: question.text,
        options: question.options.map((option, optIndex) => ({
          optionId: option._id, // Use the stored option ID
          optionText: option.text,
          imageURL: option.imageURL, // Ensure imageURL is sent in the update
          isCorrect: correctAnswers[index] === optIndex,
        })),
        timer: validateTimer(questionTimers[index]),
      })),
    };

    try {
      setLoadingState(true);
      const response = await apiClient.patch(
        `/quiz/update/${quizId}`,
        updatedQuizData
      );
      // console.log(response);

      setQuizLink(response.data.data.quizLink);
      setLoadingState(false);
      toastr.success("Quiz updated successfully!");
      setCreated(true);
    } catch (error) {
      console.error("Error updating quiz", error);
      if (error.response && error.response.data) {
        toastr.error(`Error: ${error.response.data.message}`);
      } else {
        toastr.error("Failed to update quiz. Please try again.");
      }
    }
  };

  // Helper function to validate and convert timer
  const validateTimer = (timerValue) => {
    const timerMap = {
      OFF: 0,
      "5 sec": 5,
      "10 sec": 10,
    };

    if (timerMap.hasOwnProperty(timerValue)) {
      return timerMap[timerValue];
    } else {
      return 0; // Default to 0 (OFF) if something goes wrong
    }
  };

  return (
    <>
      {loading && <Loader />}
      {!created ? (
        <div className="poll-form">
          <div className="question-tabs">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`question-tab ${
                  index === selectedQuestionIndex ? "active" : ""
                }`}
              >
                <span
                  onClick={() => setSelectedQuestionIndex(index)}
                  className="question-tab-span"
                >
                  {index + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    className="delete-question-btn"
                    onClick={() => handleDeleteQuestion(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <p>Max 5 questions</p>
          </div>

          {questions.length > 0 && (
            <div className="question-block">
              <div className="question-header">
                <input
                  type="text"
                  placeholder="Q & A Question"
                  className="question-input"
                  value={questions[selectedQuestionIndex].text}
                  onChange={(e) =>
                    handleQuestionChange(e, selectedQuestionIndex)
                  }
                />
              </div>

              <div className="option-type-selector">
                <label>Option Type</label>
                <div>
                  <input
                    type="radio"
                    id={`text-${selectedQuestionIndex}`}
                    name={`optionType${selectedQuestionIndex}`}
                    value="Text"
                    checked={
                      selectedOptionTypes[selectedQuestionIndex] === "Text"
                    }
                    readOnly
                  />
                  <label htmlFor={`text-${selectedQuestionIndex}`}>Text</label>

                  <input
                    type="radio"
                    id={`image-${selectedQuestionIndex}`}
                    name={`optionType${selectedQuestionIndex}`}
                    value="Image URL"
                    checked={
                      selectedOptionTypes[selectedQuestionIndex] === "Image URL"
                    }
                    readOnly
                  />
                  <label htmlFor={`image-${selectedQuestionIndex}`}>
                    Image URL
                  </label>

                  <input
                    type="radio"
                    id={`textImage-${selectedQuestionIndex}`}
                    name={`optionType${selectedQuestionIndex}`}
                    value="Text and Image URL"
                    checked={
                      selectedOptionTypes[selectedQuestionIndex] ===
                      "Text and Image URL"
                    }
                    readOnly
                  />
                  <label htmlFor={`textImage-${selectedQuestionIndex}`}>
                    Text & Image URL
                  </label>
                </div>
              </div>

              <div className="options-selector">
                {questions[selectedQuestionIndex].options.map(
                  (option, optIndex) => (
                    <div key={optIndex} className="option">
                      <input
                        type="radio"
                        name={`correctAnswer${selectedQuestionIndex}`}
                        checked={
                          correctAnswers[selectedQuestionIndex] === optIndex
                        }
                        readOnly
                      />

                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Text" && (
                        <input
                          type="text"
                          placeholder="Text"
                          className={`option-input ${
                            correctAnswers[selectedQuestionIndex] === optIndex
                              ? "correct-selected"
                              : ""
                          }`}
                          value={option.text}
                          onChange={(e) =>
                            handleOptionTextChange(
                              e,
                              selectedQuestionIndex,
                              optIndex
                            )
                          }
                        />
                      )}

                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Image URL" && (
                        <input
                          type="text"
                          placeholder="Image URL"
                          className={`option-input ${
                            correctAnswers[selectedQuestionIndex] === optIndex
                              ? "correct-selected"
                              : ""
                          }`}
                          value={option.imageURL}
                          onChange={(e) =>
                            handleOptionImageURLChange(
                              e,
                              selectedQuestionIndex,
                              optIndex
                            )
                          }
                        />
                      )}

                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Text and Image URL" && (
                        <>
                          <input
                            type="text"
                            placeholder="Text"
                            className={`option-input text-option-input-update ${
                              correctAnswers[selectedQuestionIndex] === optIndex
                                ? "correct-selected"
                                : ""
                            }`}
                            value={option.text}
                            onChange={(e) =>
                              handleOptionTextChange(
                                e,
                                selectedQuestionIndex,
                                optIndex
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            className={`option-input ${
                              correctAnswers[selectedQuestionIndex] === optIndex
                                ? "correct-selected"
                                : ""
                            }`}
                            value={option.imageURL}
                            onChange={(e) =>
                              handleOptionImageURLChange(
                                e,
                                selectedQuestionIndex,
                                optIndex
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                  )
                )}
                <button
                  className="add-option-btn"
                  onClick={() => handleAddOption(selectedQuestionIndex)}
                  disabled
                >
                  Add option
                </button>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="create-quiz-btn"
              onClick={handleUpdateQuiz}
              type="button"
            >
              Update Quiz
            </button>
          </div>

          <div className="timer-section">
            <label>Timer</label>
            <div className="timer-options">
              <button
                className={`timer-btn ${
                  questionTimers[selectedQuestionIndex] === "OFF"
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleTimerChange(selectedQuestionIndex, "OFF")}
              >
                OFF
              </button>
              <button
                className={`timer-btn ${
                  questionTimers[selectedQuestionIndex] === "5 sec"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleTimerChange(selectedQuestionIndex, "5 sec")
                }
              >
                5 sec
              </button>
              <button
                className={`timer-btn ${
                  questionTimers[selectedQuestionIndex] === "10 sec"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleTimerChange(selectedQuestionIndex, "10 sec")
                }
              >
                10 sec
              </button>
            </div>
          </div>
        </div>
      ) : (
        <CopyLinkModal
          created={created}
          setCreated={setCreated}
          setShow={setShow}
          setNext={setNext}
          resetForm1={resetForm1}
          setSelectedType={setSelectedType}
          quizLink={quizLink}
        />
      )}
    </>
  );
};

export default QuizDetails;
