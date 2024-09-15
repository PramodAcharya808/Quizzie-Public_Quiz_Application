import "./CreateQuizModal.css";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import QuizDetails from "./../quizDetails/QuizDetails";
import PollDetails from "../quizDetails/PollDetails";

const CreateQuizModal = ({ show, setShow }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [next, setNext] = useState(false);
  const [quizInfo, setQuizInfo] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const handleSelection = useCallback(
    (type) => {
      if (type !== selectedType) {
        setSelectedType(type);
        clearErrors("quizType");
      }
    },
    [selectedType, clearErrors]
  );

  const onSubmit = useCallback(
    (data) => {
      if (!selectedType) {
        setError("quizType", {
          type: "manual",
          message: "Quiz type is required",
        });
        return;
      }

      const formData = {
        quizName: data.quizName,
        quizType: selectedType,
      };

      setQuizInfo(formData);
      setNext(true);
    },
    [selectedType, setError]
  );

  const handleCancel = useCallback(() => {
    reset();
    setSelectedType(null);
    setQuizInfo({});
    setShow(false);
  }, [reset, setShow]);

  if (!show) return null;

  return (
    <div className="create-quiz-overlay">
      {!next ? (
        <form
          className="create-quiz-container"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            placeholder="Quiz name"
            className="quiz-name-input"
            {...register("quizName", {
              required: "Quiz name is required",
              maxLength: {
                value: 24,
                message: "Quiz name should be at most 24 characters long",
              },
            })}
          />

          <div className="quiz-type-selector-container">
            <label className="quiz-type-label">Quiz Type</label>
            <div
              className={
                selectedType === "Q&A"
                  ? `selected quiz-selector`
                  : `quiz-selector`
              }
              onClick={() => handleSelection("Q&A")}
            >
              Q & A
            </div>
            <div
              className={
                selectedType === "POLL"
                  ? `selected quiz-selector`
                  : `quiz-selector`
              }
              onClick={() => handleSelection("POLL")}
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
        />
      ) : (
        <PollDetails
          setShow={setShow}
          setNext={setNext}
          resetForm1={reset}
          quizInfo={quizInfo}
          setSelectedType={setSelectedType}
          setQuizInfo={setQuizInfo}
        />
      )}
    </div>
  );
};

export default CreateQuizModal;
