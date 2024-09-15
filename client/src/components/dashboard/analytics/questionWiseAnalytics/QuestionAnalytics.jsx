import React, { useEffect, useState } from "react";
import "./QuestionAnalytics.css";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import CountUp from "react-countup";
import { format, parseISO } from "date-fns";
import QuestionCard from "./questionCard/QuestionCard";
import { useAuth } from "../../../../context/AuthContext";
import Loader from "./../../../loader/Loader";
import apiClient from "./../../../../utils/apiClient";

const QuestionAnalytics = () => {
  const { loading, setLoadingState } = useAuth();
  const [quizDetails, setQuizDetails] = useState({
    totalImpressions: 0,
    createdAt: "",
    quizName: "",
    questions: [],
  });
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [show404, setShow404] = useState(false);
  const { quizId } = useParams();

  function formatDate(date) {
    if (!date) return "";
    return format(parseISO(date), "dd MMM, yyyy");
  }

  useEffect(() => {
    async function getQuestion() {
      try {
        setLoadingState(true);
        const response = await apiClient.get(
          `/analytics/getquestionwiseanalytics/${quizId}`
        );
        if (response.status === 200 && response.data.data) {
          setQuizDetails(response.data.data);
        } else if (response.status === 403) {
          setRedirectToDashboard(true);
        } else if (response.status === 404) {
          setShow404(true);
        } else {
          console.error("Unexpected response structure:", response.data);
        }
        setLoadingState(false);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setRedirectToDashboard(true);
        } else if (error.response && error.response.status === 404) {
          setShow404(true);
        } else {
          console.error("Error fetching quiz details:", error);
        }
      }
    }
    getQuestion();
  }, [quizId]);

  if (redirectToDashboard) {
    return <Navigate to="/dashboard" />;
  }

  if (show404) {
    return <Navigate to="/404" />;
  }

  return (
    <>
      {loading && <Loader />}
      <div className="question-analysis-container">
        <div className="question-info">
          <div className="quiz-question-name">
            <h1>{quizDetails.quizName} Question Analysis</h1>
          </div>
          <div className="quiz-meta-data">
            <h2>Created on : {formatDate(quizDetails.createdAt)}</h2>
            <h2>
              Impressions :{" "}
              <CountUp
                start={0}
                end={quizDetails.totalImpressions}
                duration={2}
              />
            </h2>
          </div>
        </div>
        <div className="questions-container">
          <div className="question-inner-container">
            {quizDetails.questions && quizDetails.questions.length > 0 ? (
              quizDetails.questions.map((question, index) => (
                <QuestionCard
                  key={index}
                  index={index + 1}
                  questionText={question.questionText}
                  totalAnswered={question.totalAnswered}
                  totalCorrect={question.totalCorrect}
                  totalWrong={question.totalWrong}
                />
              ))
            ) : (
              <p>No questions available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionAnalytics;
