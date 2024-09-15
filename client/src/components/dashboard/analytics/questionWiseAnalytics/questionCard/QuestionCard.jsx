import React from "react";
import "./QuestionCard.css";

const QuestionCard = ({
  index,
  questionText,
  totalAnswered,
  totalCorrect,
  totalWrong,
}) => {
  return (
    <div className="question-card-container">
      <h1 className="question-text">
        Q.{index} {questionText}
      </h1>

      <div className="question-card-stats">
        <div className="q-card">
          <h2>{totalAnswered}</h2>
          <p>People Attempted the question</p>
        </div>
        <div className="q-card">
          <h2>{totalCorrect}</h2>
          <p>People Answered Correctly</p>
        </div>
        <div className="q-card">
          <h2>{totalWrong}</h2>
          <p>People Answered Incorrectly</p>
        </div>
      </div>
      <div className="line-break"></div>
    </div>
  );
};

export default QuestionCard;
