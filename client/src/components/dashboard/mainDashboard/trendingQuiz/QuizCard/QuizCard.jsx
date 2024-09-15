import React from "react";
import { Eye } from "../../../../Icons/CustomIcons";
import "./QuizCard.css";
import { format, parseISO } from "date-fns";

const QuizCard = ({ trendingQuiz }) => {
  function formatDate(date) {
    return format(parseISO(date), "dd MMM, yyyy");
  }

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  }

  return (
    <div className="quizCardContainer">
      {trendingQuiz.data && trendingQuiz.data.length > 0 ? (
        trendingQuiz.data.map((quiz, index) => (
          <div key={index} className="trending-quiz-card">
            <div className="quiz-info">
              <div className="quiz-name-container">
                <marquee className="quiz-name">{quiz.quizName}</marquee>
              </div>
              <div className="quiz-impression-container">
                <p className="quiz-impression">
                  {formatNumber(quiz.impressions)}
                  <span className="eye-icon">
                    <Eye />
                  </span>
                </p>
              </div>
            </div>
            <div className="quiz-date">
              <p>Created on : {formatDate(quiz.createdAt)}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No trending quizzes available.</p>
      )}
    </div>
  );
};

export default QuizCard;
