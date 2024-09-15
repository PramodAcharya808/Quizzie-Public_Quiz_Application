import React, { useEffect, useState, useRef } from "react";

const TextUrlOverlay = ({
  questionText, // Added to display question text
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

  useEffect(() => {
    // Reset the timer when a new question is loaded
    setTimeLeft(timer);

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
  };

  return (
    <div className="question-overlay">
      <div className="numerics">
        <p className="question-num">{`${currentQuestionNumber
          .toString()
          .padStart(2, "0")}/${totalQuestions.toString().padStart(2, "0")}`}</p>
        {timeLeft > 0 && <p className="question-timer">{`00:${timeLeft}s`}</p>}
      </div>
      <p className="question-text-holder">
        {questionText} {/* Display the question text */}
      </p>
      <div className="texturl-game-container">
        {options.map((option) => (
          <div
            key={option._id}
            className={`texturl-option-holder ${
              option._id === selectedOptionId ? "game-selected" : ""
            }`}
            onClick={() => handleOptionClick(option._id)}
          >
            <div className="text-url-text">{option.optionText}</div>
            <div className="texturl-image">
              <img
                src={option.imageURL || "https://picsum.photos/400/500"}
                alt="Option"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className="game-continue-btn game-url-continue-btn"
        onClick={isLastQuestion ? onSubmit : onNext}
      >
        {isLastQuestion ? "SUBMIT" : "NEXT"}
      </button>
    </div>
  );
};

export default TextUrlOverlay;
