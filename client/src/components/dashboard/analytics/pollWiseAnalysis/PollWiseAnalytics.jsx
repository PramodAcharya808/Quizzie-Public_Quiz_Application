import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import CountUp from "react-countup";
import { format, parseISO } from "date-fns";
import PollCard from "./pollCard/PollCard";
import "./PollWiseAnalytics.css";
import { useAuth } from "../../../../context/AuthContext";
import Loader from "./../../../loader/Loader";
import apiClient from "./../../../../utils/apiClient";

const PollWiseAnalytics = () => {
  const { loading, setLoadingState } = useAuth();
  const [quizDetails, setQuizDetails] = useState({
    totalImpressions: 0,
    createdAt: "",
    quizName: "",
    questions: [
      {
        options: [
          {
            totalSelected: 0,
          },
          {
            totalSelected: 0,
          },
          {
            totalSelected: 0,
          },
          {
            totalSelected: 0,
          },
        ],
      },
    ],
  });
  const { quizId } = useParams();

  function formatDate(date) {
    if (!date) return "";
    return format(parseISO(date), "dd MMM, yyyy");
  }

  useEffect(() => {
    async function getPoll() {
      setLoadingState(true);
      const response = await apiClient.get(
        `/analytics/getpollanalytics/${quizId}`
      );
      if (response.data.data) {
        setQuizDetails(response.data.data);
      }
      setLoadingState(false);
    }
    getPoll();
  }, [quizId]);

  // console.log(quizDetails.questions[0].options[0].totalSelected);
  // quizDetails.questions.map((data) => {
  //   console.log(data.options);
  // });

  return (
    <>
      {loading && <Loader />}
      <div className="poll-analysis-container">
        <div className="poll-info">
          <div className="poll-question-name">
            <h1>{quizDetails.quizName} Question Analysis</h1>
          </div>
          <div className="poll-meta-data">
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
        <div className="poll-container">
          <div className="poll-inner-container">
            {quizDetails.questions.map((question, index) => (
              <PollCard
                key={index}
                index={index + 1}
                questionText={question.questionText}
                options={question.options}
              />
            ))}
          </div>
          ;
        </div>
      </div>
    </>
  );
};

export default PollWiseAnalytics;
