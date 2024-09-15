import React from "react";

const QnaResult = ({ results }) => {
  if (!results) return null; // Ensure that results are available

  const { totalCorrect, totalQuestions } = results;

  return (
    <div className="qna-result-container">
      <p className="congrats">Congrats, the quiz is completed!</p>
      <img src="/congrats-trophy.png" alt="Trophy" />
      <p className="score-display">
        Your score is <span>{`${totalCorrect}/${totalQuestions}`}</span>
      </p>
    </div>
  );
};

export default QnaResult;
