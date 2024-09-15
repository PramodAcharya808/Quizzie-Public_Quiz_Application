import React from "react";
import "./PollCard.css";

const PollCard = ({ index, questionText, options }) => {
  // console.log(options);
  // options.map((data) => console.log(data.totalSelected));

  return (
    <div className="question-card-container">
      <h1 className="question-text">
        Q.{index} {questionText}
      </h1>

      <div className="question-card-stats">
        {options.map((options, index) => (
          <div className="p-card" key={index}>
            <h2>{options.totalSelected}</h2>
            <p>Option {index + 1}</p>
          </div>
        ))}
      </div>
      <div className="p-line-break"></div>
    </div>
  );
};

export default PollCard;
