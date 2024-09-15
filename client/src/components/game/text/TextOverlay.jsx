import React, { useEffect, useState, useRef } from "react";

const TextOverlay = ({
  questionText,
  options,
  onOptionClick,
  timer,
  currentQuestionNumber,
  totalQuestions,
  onNext,
  onSubmit,
}) => {
  const [timeLeft, setTimeLeft] = useState(timer);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const intervalRef = useRef(null);
  const isLastQuestion = currentQuestionNumber === totalQuestions;

  // console.log("Full render");

  useEffect(() => {
    // Reset the timer when a new question is loaded
    setTimeLeft(timer);
    // console.log("Rendered inside useeffect");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            onNext();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [currentQuestionNumber]);

  const handleOptionClick = (optionId) => {
    setSelectedOptionId(optionId);
    onOptionClick(optionId);
    // console.log("Rendered inside option clicked");
  };

  return (
    <div className="question-overlay">
      <div className="numerics">
        <p className="question-num">{`${currentQuestionNumber
          .toString()
          .padStart(2, "0")}/${totalQuestions.toString().padStart(2, "0")}`}</p>
        {timeLeft > 0 && <p className="question-timer">{`00:${timeLeft}s`}</p>}
      </div>
      <p className="question-text-holder">{questionText}</p>
      <div className="game-options-container">
        {options.map((option) => (
          <div
            key={option._id}
            className={`text-option-holder ${
              option._id === selectedOptionId ? "game-selected" : ""
            }`}
            onClick={() => handleOptionClick(option._id)}
          >
            {option.optionText}
          </div>
        ))}
      </div>
      <button
        className="text-game-continue-btn"
        onClick={isLastQuestion ? onSubmit : onNext}
      >
        {isLastQuestion ? "SUBMIT" : "NEXT"}
      </button>
    </div>
  );
};

export default TextOverlay;
