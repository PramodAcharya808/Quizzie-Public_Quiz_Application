import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useAuth } from "../../../context/AuthContext";

import "react-toastify/dist/ReactToastify.css";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import TrendingQuiz from "./trendingQuiz/TrendingQuiz";
import CountUp from "react-countup";
import CreateQuizModal from "../../modals/createQuizModal/quizNameType/CreateQuizModal";
import Loader from "../../loader/Loader";
import apiClient from "../../../utils/apiClient";

const Dashboard = () => {
  const { logout, loading, setLoadingState } = useAuth();
  const url = useLocation();

  const [totalQuiz, setTotalquiz] = useState();
  const [totalQuestions, setTotalquestions] = useState(0);
  const [totalImpressions, setTotalimpressions] = useState(0);
  const [show, setShow] = useState(false);

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  }

  useEffect(() => {
    async function getData() {
      setLoadingState(true);
      const totalquiz = await apiClient.get(
        "/analytics/totalQuiz",
        {},
        { withCredentials: true }
      );
      const totalquestions = await apiClient.get(
        "/analytics/totalquestions",
        {},
        { withCredentials: true }
      );
      const totalimpressions = await apiClient.get(
        "/analytics/totalimpressions",
        {},
        { withCredentials: true }
      );
      const quiz = formatNumber(totalquiz.data.data);
      const questions = formatNumber(totalquestions.data.data);
      const impressions = formatNumber(totalimpressions.data.data);
      setTotalquiz(quiz);
      setTotalquestions(questions);
      setTotalimpressions(impressions);
      setLoadingState(false);
    }
    getData();
  }, []);

  // const handleDashboardClick = async () => {
  //   setLoadingState(true);
  //   const totalquiz = await apiClient.get(
  //     "/analytics/totalQuiz",
  //     {},
  //     { withCredentials: true }
  //   );
  //   const totalquestions = await apiClient.get(
  //     "/analytics/totalquestions",
  //     {},
  //     { withCredentials: true }
  //   );
  //   const totalimpressions = await apiClient.get(
  //     "/analytics/totalimpressions",
  //     {},
  //     { withCredentials: true }
  //   );
  //   const quiz = formatNumber(totalquiz.data.data);
  //   const questions = formatNumber(totalquestions.data.data);
  //   const impressions = formatNumber(totalimpressions.data.data);
  //   setTotalquiz(quiz);
  //   setTotalquestions(questions);
  //   setTotalimpressions(impressions);
  //   setLoadingState(false);
  // };

  return (
    <>
      {loading && <Loader />}
      <div className="main-container">
        <div className="left-section  box-shadow-3 bg-secondary">
          <div className="inner-group-1">
            <h1 className="logo secondary-font"> QUIZZIE</h1>
          </div>

          <div className="inner-group-2">
            <Link to="/dashboard">
              <div className="options">Dashboard</div>
            </Link>

            <Link to="analytics">
              <div className="options">Analytics</div>
            </Link>

            <button className="options" onClick={() => setShow(true)}>
              Create Quiz
            </button>
          </div>

          <div className="logout-container">
            <Link to="/" onClick={logout}>
              <div className="logout">LOGOUT</div>
            </Link>
          </div>
        </div>
        <div className="right-section bg-primary">
          <CreateQuizModal show={show} setShow={setShow} />
          {url.pathname === "/dashboard" ? (
            <div className="right-section-container">
              <div className="top-section">
                <div className="card-1">
                  <div className="top-card">
                    <h1 className="count">
                      <CountUp end={totalQuiz} duration={2} />
                    </h1>
                    <p className="count-label">Quiz</p>
                  </div>
                  <div className="bottom-card">
                    <p className="card-info">Created</p>
                  </div>
                </div>
                <div className="card-2">
                  <div className="top-card">
                    <h1 className="count">
                      <CountUp end={totalQuestions} duration={2} />
                    </h1>
                    <p className="count-label">Questions</p>
                  </div>
                  <div className="bottom-card">
                    <p className="card-info">Created</p>
                  </div>
                </div>
                <div className="card-3">
                  <div className="top-card">
                    <h1 className="count">
                      <CountUp end={totalImpressions} duration={2} />
                    </h1>
                    <p className="count-label">Total</p>
                  </div>
                  <div className="bottom-card">
                    <p className="card-info">Impressions</p>
                  </div>
                </div>
              </div>
              <div className="bottom-section">
                <h1 className="trending">Trending Quizs</h1>
                <div className="trending-container">
                  <TrendingQuiz />
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
