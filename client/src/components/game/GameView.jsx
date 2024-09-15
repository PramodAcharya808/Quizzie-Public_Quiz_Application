import React, { useEffect, useState, useCallback } from "react";
import "./GameView.css";
import "./GameViewMediaQuery.css";
import { v4 as uuidv4 } from "uuid";
import TextOverlay from "./text/TextOverlay";
import TextUrlOverlay from "./textUrl/TextUrlOverlay";
import UrlOverlay from "./url/UrlOverlay";
import QnaResult from "./result/QnaResult";
import PollResult from "./result/PollResult";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "./../loader/Loader";
import apiClient from "./../../utils/apiClient";
import { useAuth } from "../../context/AuthContext";

const GameView = () => {
  const { quizLink } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const { setLoadingState, loading } = useAuth();
  const [quizFound, setQuizFound] = useState(true);

  // Retrieve sessionId from local storage or create a new one
  const sessionId = localStorage.getItem("sessionId") || uuidv4();
  if (!localStorage.getItem("sessionId")) {
    localStorage.setItem("sessionId", sessionId);
  }

  // Function to increase quiz impression
  const increaseImpression = useCallback(async (quizId) => {
    try {
      await apiClient.post(`/analytics/increaseimpression/${quizId}`);
    } catch (error) {
      console.error("Failed to increase quiz impression", error);
    }
  }, []);

  useEffect(() => {
    async function getQuiz() {
      try {
        const response = await apiClient.get(`/public/quiz/${quizLink}`);
        if (response.data.data.status === 404) {
          setQuizFound(false);
        }

        setQuizData(response.data.data);

        // Increase impression once when the quiz data is successfully fetched
        increaseImpression(response.data.data._id);
      } catch (error) {
        console.error(error);
      }
    }
    getQuiz();

    // Clear sessionId when the page is refreshed
    const handleBeforeUnload = () => {
      localStorage.removeItem("sessionId");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizLink, increaseImpression]);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex + 1 === quizData.questions.length) {
      setIsSubmitting(true);
      await handleSubmit();
    } else {
      const question = quizData.questions[currentQuestionIndex];
      const answerData = {
        quizId: quizData._id,
        questionId: question._id,
        selectedOptionId: selectedOption || null,
        sessionId,
      };

      try {
        setLoadingState(true);
        await apiClient.post("/public/quiz/start/", answerData);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setLoadingState(false);
        setSelectedOption(null);
      } catch (error) {
        console.error(error);
      }
    }
  }, [currentQuestionIndex, quizData, selectedOption, sessionId]);

  const handleSubmit = useCallback(async () => {
    const question = quizData.questions[currentQuestionIndex];
    const answerData = {
      quizId: quizData._id,
      questionId: question._id,
      selectedOptionId: selectedOption || null,
      sessionId,
    };

    try {
      setLoadingState(true);
      const response = await apiClient.post("/public/quiz/start/", answerData);
      const { totalCorrect, totalQuestions } = response.data.data;
      setLoadingState(false);
      setQuizCompleted(true);
      setResults({ totalCorrect, totalQuestions });
      setQuizCompleted(true);
      localStorage.removeItem("sessionId");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestionIndex, quizData, selectedOption, sessionId]);

  const handleOptionClick = useCallback((optionId) => {
    setSelectedOption(optionId);
  }, []);

  if (quizCompleted) {
    return quizData.quizType === "Q&A" ? (
      <div className="game-view-container">
        <QnaResult results={results} />
      </div>
    ) : (
      <div className="game-view-container">
        <PollResult />
      </div>
    );
  }

  if (isSubmitting) {
    return <Loader />;
  }

  if (!quizFound) {
    return (
      <div className="game-view-container">
        <div className="quiz-not-found-message">
          <div className="oops">Oops!</div>
          The quiz you are trying to access does not exist.
        </div>
      </div>
    );
  }

  if (!quizData) return <Loader />;

  const question = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const currentQuestionNumber = currentQuestionIndex + 1;

  return (
    <>
      {loading && <Loader />}
      <div className="game-view-container">
        {question.optionType === "Text" && (
          <TextOverlay
            questionText={question.questionText}
            options={question.options}
            onOptionClick={handleOptionClick}
            timer={question.timer}
            currentQuestionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}
        {question.optionType === "Text and Image URL" && (
          <TextUrlOverlay
            questionText={question.questionText}
            options={question.options}
            onOptionClick={handleOptionClick}
            timer={question.timer}
            currentQuestionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}
        {question.optionType === "Image URL" && (
          <UrlOverlay
            questionText={question.questionText}
            options={question.options}
            onOptionClick={handleOptionClick}
            timer={question.timer}
            currentQuestionNumber={currentQuestionNumber}
            totalQuestions={totalQuestions}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
};

export default GameView;
