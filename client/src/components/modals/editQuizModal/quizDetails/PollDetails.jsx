import React, { useEffect, useState } from "react";
import "./QuizDetails.css";
import axios from "axios";
import "./PollDetails.css";
import CopyLinkModal from "../copyLinkModal/CopyLinkModal";
import toastr from "toastr";
import { useAuth } from "../../../../context/AuthContext";
import Loader from "./../../../loader/Loader";
import apiClient from "./../../../../utils/apiClient";

const PollDetails = ({
  setShow,
  setNext,
  resetForm1,
  quizInfo,
  setQuizInfo,
  setSelectedType,
  quizId,
}) => {
  const handleCancel = () => {
    setShow(false);
    setNext(false);
    resetForm1();
    setQuizInfo({});
    setSelectedType(null);
  };

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptionTypes, setSelectedOptionTypes] = useState([]);
  const [created, setCreated] = useState(false);
  const [quizLink, setQuizLink] = useState("");
  const { loading, setLoadingState } = useAuth();
  // Fetching poll data
  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoadingState(true);
        const response = await apiClient.get(`/quiz/view/${quizId}`);
        const quizData = response.data.data;
        setLoadingState(false);

        // Populate state with quiz data
        setQuestions(
          quizData.questions.map((question) => ({
            _id: question._id, // Store question ID
            text: question.questionText,
            options: question.options.map((option) => ({
              _id: option._id, // Store option ID
              text: option.optionText,
              imageUrl: option.imageURL,
            })),
          }))
        );
        setSelectedOptionTypes(
          quizData.questions.map((question) => question.optionType)
        );
      } catch (error) {
        console.error("Error fetching poll data", error);
        toastr.error("Failed to fetch poll data");
      }
    }

    fetchQuizData();
  }, [quizId]);

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

  const validateForm = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        toastr.error(`Question ${i + 1} is required.`);
        return false;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        const optionType = selectedOptionTypes[i];
        const option = questions[i].options[j];

        if (optionType === "Text" && !option.text.trim()) {
          toastr.error(
            `Text for Option ${j + 1} in Question ${i + 1} is required.`
          );
          return false;
        }

        if (optionType === "Image URL" && !option.imageUrl.trim()) {
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
          if (!option.imageUrl.trim()) {
            toastr.error(
              `Image URL for Option ${j + 1} in Question ${i + 1} is required.`
            );
            return false; // Ensure this return is within the condition
          }
        }
      }
    }
    return true;
  };

  const handleUpdatePoll = async () => {
    if (!validateForm()) {
      return;
    }

    // console.log(questions);

    // Ensure that questionId and optionId are included
    const updatedQuizData = {
      questions: questions.map((question) => ({
        questionId: question._id, // Use the stored question ID
        questionText: question.text,
        options: question.options.map((option) => ({
          optionId: option._id, // Use the stored option ID
          optionText: option.text,
          imageURL: option.imageUrl,
        })),
      })),
    };

    try {
      setLoadingState(true);
      const response = await apiClient.patch(
        `/quiz/update/${quizId}`,
        updatedQuizData
      );
      setQuizLink(response.data.data.quizLink);
      setLoadingState(false);
      toastr.success("Poll updated successfully!");
      setCreated(true);
    } catch (error) {
      console.error("Error updating poll", error);
      if (error.response && error.response.data) {
        toastr.error(`Error: ${error.response.data.message}`);
      } else {
        toastr.error("Failed to update poll. Please try again.");
      }
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
              </div>
            ))}
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

              <div className="options-selector option-selector-poll">
                {questions[selectedQuestionIndex].options.map(
                  (option, optIndex) => (
                    <div key={optIndex} className="option">
                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Text" && (
                        <input
                          type="text"
                          placeholder="Text"
                          className="option-input"
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
                      )}

                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Image URL" && (
                        <input
                          type="text"
                          placeholder="Image URL"
                          className="option-input"
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
                      )}

                      {selectedOptionTypes[selectedQuestionIndex] ===
                        "Text and Image URL" && (
                        <>
                          <input
                            type="text"
                            placeholder="Text"
                            className="option-input text-option-input-update"
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
                            className="option-input"
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
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="create-quiz-btn"
              onClick={handleUpdatePoll}
              type="button"
            >
              Update Poll
            </button>
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

export default PollDetails;
