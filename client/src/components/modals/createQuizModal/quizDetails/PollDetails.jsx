import React, { useState } from "react";
import "./QuizDetails.css";
import toastr from "toastr";
import { Delete } from "../../../Icons/CustomIcons";
import axios from "axios";
import "./PollDetails.css";
import { useAuth } from "../../../../context/AuthContext";
import CopyLinkModal from "../copyLinkModal/CopyLinkModal";
import Loader from "./../../../loader/Loader";
import apiClient from "./../../../../utils/apiClient";

const PollDetails = ({
  setShow,
  setNext,
  resetForm1,
  quizInfo,
  setQuizInfo,
  setSelectedType,
}) => {
  const handleCancel = () => {
    setShow(false);
    setNext(false);
    resetForm1();
    setQuizInfo({});
    setSelectedType(null);
  };
  const { loading, setLoadingState } = useAuth();
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: [
        { text: "", imageUrl: "" },
        { text: "", imageUrl: "" },
      ],
    },
  ]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptionTypes, setSelectedOptionTypes] = useState(["Text"]);
  const [correctAnswers, setCorrectAnswers] = useState([null]);
  const [created, setCreated] = useState(false);
  const [quizLink, setQuizLink] = useState("");

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          text: "",
          options: [
            { text: "", imageUrl: "" },
            { text: "", imageUrl: "" },
          ],
        },
      ]);
      setCorrectAnswers([...correctAnswers, null]);
      setSelectedOptionTypes([...selectedOptionTypes, "Text"]);
      setSelectedQuestionIndex(questions.length);
    } else {
      toastr.error("You can only add up to 5 questions.");
    }
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
      setSelectedOptionTypes(selectedOptionTypes.filter((_, i) => i !== index));
      setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
    }
  };

  const handleAddOption = (questionIndex) => {
    if (questions[questionIndex].options.length < 4) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options.push({ text: "", imageUrl: "" });
      setQuestions(updatedQuestions);
    } else {
      toastr.error("You can only add up to 4 options.");
    }
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    if (questions[questionIndex].options.length > 2) {
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
      if (correctAnswers[questionIndex] === optionIndex) {
        const updatedCorrectAnswers = [...correctAnswers];
        updatedCorrectAnswers[questionIndex] = null;
        setCorrectAnswers(updatedCorrectAnswers);
      }
    }
  };

  const handleQuestionChange = (e, index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (e, questionIndex, optionIndex, field) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex][field] =
      e.target.value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedCorrectAnswers = [...correctAnswers];
    updatedCorrectAnswers[questionIndex] = optionIndex;
    setCorrectAnswers(updatedCorrectAnswers);
  };

  const handleOptionTypeChange = (questionIndex, optionType) => {
    const updatedOptionTypes = [...selectedOptionTypes];
    updatedOptionTypes[questionIndex] = optionType;
    setSelectedOptionTypes(updatedOptionTypes);
  };

  const validateForm = () => {
    if (!quizInfo.quizName || !quizInfo.quizType) {
      toastr.error("Quiz name and type are required.");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text) {
        toastr.error(`Question ${i + 1} is required.`);
        return false;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (
          !questions[i].options[j].text &&
          selectedOptionTypes[i] !== "Image URL"
        ) {
          toastr.error(`Option ${j + 1} in Question ${i + 1} is required.`);
          return false;
        }
        if (
          selectedOptionTypes[i] !== "Text" &&
          !questions[i].options[j].imageUrl
        ) {
          toastr.error(
            `Image URL for Option ${j + 1} in Question ${i + 1} is required.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateForm()) {
      return;
    }

    const quizData = {
      quizName: quizInfo.quizName,
      quizType: quizInfo.quizType,
      questions: questions.map((question, index) => ({
        questionText: question.text,
        optionType: selectedOptionTypes[index],
        options: question.options.map((option, optIndex) => ({
          optionText: option.text,
          imageURL: option.imageUrl,
          isCorrect: correctAnswers[index] === optIndex,
        })),
      })),
    };

    // console.log(quizData);

    try {
      setLoadingState(true);
      const response = await apiClient.post("/quiz/create", quizData);
      // console.log(response);
      setQuizLink(response.data.data.quizLink);
      setLoadingState(false);
      toastr.success("Poll created successfully!");
      setCreated(true);
    } catch (error) {
      console.log(error);
      toastr.error("Failed to create quiz. Please try again.");
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
            <button className="add-question-btn" onClick={handleAddQuestion}>
              +
            </button>
            <p>Max 5 questions</p>
          </div>

          {questions.length > 0 && (
            <div className="question-block">
              <div className="question-header">
                <input
                  type="text"
                  placeholder="Poll Question"
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
                    onChange={(e) =>
                      handleOptionTypeChange(
                        selectedQuestionIndex,
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      handleOptionTypeChange(
                        selectedQuestionIndex,
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      handleOptionTypeChange(
                        selectedQuestionIndex,
                        e.target.value
                      )
                    }
                  />
                  <label htmlFor={`textImage-${selectedQuestionIndex}`}>
                    Text & Image URL
                  </label>
                </div>
              </div>

              <div className="options-selector option-selector-poll">
                {questions[selectedQuestionIndex].options.map(
                  (option, optIndex) => (
                    <div key={optIndex} className="option">
                      {selectedOptionTypes[selectedQuestionIndex] ===
                      "Text and Image URL" ? (
                        <>
                          <input
                            type="text"
                            id="textInput"
                            placeholder="Text"
                            className={`option-input   ${
                              correctAnswers[selectedQuestionIndex] === optIndex
                                ? "correct-selected"
                                : ""
                            }`}
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(
                                e,
                                selectedQuestionIndex,
                                optIndex,
                                "text"
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            id="imageUrlInput"
                            className={`option-input ${
                              correctAnswers[selectedQuestionIndex] === optIndex
                                ? "correct-selected"
                                : ""
                            }`}
                            value={option.imageUrl}
                            onChange={(e) =>
                              handleOptionChange(
                                e,
                                selectedQuestionIndex,
                                optIndex,
                                "imageUrl"
                              )
                            }
                          />
                        </>
                      ) : (
                        <input
                          type="text"
                          placeholder={
                            selectedOptionTypes[selectedQuestionIndex] ===
                            "Image URL"
                              ? "Image URL"
                              : "Text"
                          }
                          className={`option-input ${
                            correctAnswers[selectedQuestionIndex] === optIndex
                              ? "correct-selected"
                              : ""
                          }`}
                          value={
                            selectedOptionTypes[selectedQuestionIndex] ===
                            "Image URL"
                              ? option.imageUrl
                              : option.text
                          }
                          onChange={(e) =>
                            handleOptionChange(
                              e,
                              selectedQuestionIndex,
                              optIndex,
                              selectedOptionTypes[selectedQuestionIndex] ===
                                "Image URL"
                                ? "imageUrl"
                                : "text"
                            )
                          }
                        />
                      )}
                      {questions[selectedQuestionIndex].options.length > 2 && (
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteOption(selectedQuestionIndex, optIndex)
                          }
                        >
                          <Delete />
                        </button>
                      )}
                    </div>
                  )
                )}
                <button
                  className="add-option-btn option-btn-poll"
                  onClick={() => handleAddOption(selectedQuestionIndex)}
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
              onClick={handleCreateQuiz}
              type="button" 
            >
              Create Quiz
            </button>
          </div>

          {/* <div className="timer-section">
          <label>Timer</label>
          <div className="timer-options">
            <button
              className={`timer-btn ${
                selectedTimer === "OFF" ? "selected" : ""
              }`}
              onClick={() => setSelectedTimer("OFF")}
            >
              OFF
            </button>
            <button
              className={`timer-btn ${
                selectedTimer === "5 sec" ? "selected" : ""
              }`}
              onClick={() => setSelectedTimer("5 sec")}
            >
              5 sec
            </button>
            <button
              className={`timer-btn ${
                selectedTimer === "10 sec" ? "selected" : ""
              }`}
              onClick={() => setSelectedTimer("10 sec")}
            >
              10 sec
            </button>
          </div>
        </div> */}
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

export default PollDetails;
