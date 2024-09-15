import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/LoginSignup";
import Dashboard from "./components/dashboard/mainDashboard/Dashboard";
import { useAuth } from "./context/AuthContext";
import Analytics from "./components/dashboard/analytics/allAnalytics/Analytics";
import NotFound from "./components/404/NotFound ";
import QuestionAnalytics from "./components/dashboard/analytics/questionWiseAnalytics/QuestionAnalytics";
import PollWiseAnalytics from "./components/dashboard/analytics/pollWiseAnalysis/PollWiseAnalytics";
import GameView from "./components/game/GameView";
import "./App.css";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

function App() {
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "3000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };
  const { loggedIn } = useAuth();
  console.log("Authenticated: ", loggedIn);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!loggedIn ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={loggedIn ? <Dashboard /> : <Navigate to="/" />}
        >
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="questionanalytics/:quizId"
            element={<QuestionAnalytics />}
          />
          <Route
            path="getpollanalytics/:quizId"
            element={<PollWiseAnalytics />}
          />
        </Route>
        <Route path="/publicquiz/:quizLink" element={<GameView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
