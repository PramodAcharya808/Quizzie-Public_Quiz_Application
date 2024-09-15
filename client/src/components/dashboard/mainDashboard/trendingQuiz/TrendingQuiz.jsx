import React, { useEffect, useState } from "react";
import "./TrendingQuiz.css";
import axios from "axios";
import { Eye } from "../../../Icons/CustomIcons";
import QuizCard from "./QuizCard/QuizCard";
import Loader from "./../../../loader/Loader";
import { useAuth } from "../../../../context/AuthContext";
import apiClient from "./../../../../utils/apiClient";

const TrendingQuiz = () => {
  const [trendingQuiz, setTrendingQuiz] = useState([]);
  const { loading, setLoadingState } = useAuth();
  useEffect(() => {
    async function fecthTrending() {
      setLoadingState(true);
      try {
        const trendingQuizList = await apiClient.get("/analytics/trendingquiz");
        setTrendingQuiz(trendingQuizList.data);
      } catch (error) {
        console.error("Error fetching trending quizzes:", error);
      }
      setLoadingState(false);
    }
    fecthTrending();
  }, []);

  // useEffect(() => {
  //   // console.log(trendingQuiz.data);
  //   if (trendingQuiz.data) {
  //     trendingQuiz.data.map((quiz) => console.log(quiz));
  //     // console.log("Trending Quiz", trendingQuiz.data);
  //   }
  // }, [trendingQuiz]);

  return (
    <div className="trending-quiz-container">
      {loading && <Loader />}
      <QuizCard trendingQuiz={trendingQuiz} />
    </div>
  );
};

export default TrendingQuiz;
