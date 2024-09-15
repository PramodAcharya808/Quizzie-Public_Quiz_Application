import "./UpdateQuizModal.css";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import QuizDetails from "../quizDetails/QuizDetails";
import PollDetails from "../quizDetails/PollDetails";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import Loader from "./../../../loader/Loader";
import apiClient from "../../../../utils/apiClient";

const UpdateQuizModal = ({ show, setShow, quizId }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [next, setNext] = useState(false);
  const [quizInfo, setQuizInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        const response = await apiClient.get(`/quiz/view/${quizId}`);
        const quizData = response.data.data;
        setQuizInfo({
          quizName: quizData.quizName,
          quizType: quizData.quizType,
        });
        setSelectedType(quizData.quizType);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      }
    }
    if (show) {
      fetchQuiz();
    }
  }, [show, quizId]);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const handleCancel = useCallback(() => {
    reset();
    setSelectedType(null);
    setQuizInfo({});
    setShow(false);
  }, [reset, setShow]);

  if (!show || loading) return <Loader />;

  return (
    <div className="create-quiz-overlay">
      {!next ? (
        <form
          className="create-quiz-container"
          onSubmit={handleSubmit(() => setNext(true))}
        >
          <input
            type="text"
            placeholder="Quiz name"
            className="quiz-name-input"
            value={quizInfo.quizName || ""}
            disabled
          />

          <div className="quiz-type-selector-container">
            <label className="quiz-type-label">Quiz Type</label>
            <div
              className={
                selectedType === "Q&A"
                  ? `selected quiz-selector`
                  : `quiz-selector`
              }
            >
              Q & A
            </div>
            <div
              className={
                selectedType === "POLL"
                  ? `selected quiz-selector`
                  : `quiz-selector`
              }
            >
              Poll Type
            </div>
          </div>
          <div className="action-options">
            <div className="cancel" onClick={handleCancel}>
              Cancel
            </div>
            <button className="continue" type="submit">
              Continue
            </button>
          </div>
          {errors.quizType && (
            <p className="error-message">{errors.quizType.message}</p>
          )}
          {errors.quizName && (
            <p className="error-message">{errors.quizName.message}</p>
          )}
        </form>
      ) : selectedType === "Q&A" ? (
        <QuizDetails
          setShow={setShow}
          setNext={setNext}
          resetForm1={reset}
          quizInfo={quizInfo}
          setSelectedType={setSelectedType}
          setQuizInfo={setQuizInfo}
          quizId={quizId}
        />
      ) : (
        <PollDetails
          setShow={setShow}
          setNext={setNext}
          resetForm1={reset}
          quizInfo={quizInfo}
          setSelectedType={setSelectedType}
          setQuizInfo={setQuizInfo}
          quizId={quizId}
        />
      )}
    </div>
  );
};

export default UpdateQuizModal;
