import React, { useEffect, useState } from "react";
import "./Analytics.css";
import { Link } from "react-router-dom";
import { Delete, Edit, Share } from "./../../../Icons/CustomIcons";
import axios from "axios";
import { format, parseISO } from "date-fns";
import DeleteModal from "../../../modals/deleteModal/DeleteModal";
import UpdateQuizModal from "../../../modals/editQuizModal/quizNameType/UpdateQuizModal";
import toastr from "toastr";
import { useAuth } from "../../../../context/AuthContext";
// import "toastr/build/toastr.min.css";
import Loader from "./../../../loader/Loader";
import apiClient from "../../../../utils/apiClient";

function Analytics() {
  const [allQuizList, setAllQuizList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const { loading, setLoadingState } = useAuth();

  const handleDeleteClick = (quizId) => {
    setSelectedQuizId(quizId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmDelete = async () => {
    setLoadingState(true);
    try {
      await apiClient.delete(`/quiz/delete/${selectedQuizId}`);
      const updatedQuizzes = await apiClient.get("/quiz/getAllQuiz");
      setAllQuizList(updatedQuizzes.data.data);
      setLoadingState(false);
      setShowModal(false);
      toastr.success("Quiz deleted successfully");
    } catch (error) {
      console.log(error);
    }
    setShowUpdateModal(false);
    window.location.reload();
  };

  const handleShare = (quizLink) => {
    const quizUrl = `https://quizzie-cuvette-pramod.vercel.app/publicquiz/${quizLink}`;
    try {
      navigator.clipboard.writeText(quizUrl);
      toastr.success("Quiz link copied to clipboard");
    } catch (error) {
      toastr.error("Error. Cant copy to clipboard");
    }
  };

  const handleEditClick = (quizId) => {
    setSelectedQuizId(quizId);
    setShowUpdateModal(true);
  };

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

  useEffect(() => {
    async function fetchAllQuiz() {
      setLoadingState(true);
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/quiz/getAllQuiz");
        if (Array.isArray(response.data.data)) {
          setAllQuizList(response.data.data);
        } else {
          setAllQuizList([]);
        }
        setLoadingState(false);
      } catch (error) {
        console.log("Failed to fetch quizzes", error);
        toastr.error("Failed to fetch quizzes");
        setLoadingState(false);
      }
    }
    fetchAllQuiz();
  }, []);

  // console.log(allQuizList);

  return (
    <>
      {loading && <Loader />}
      <div className="analytics-container">
        <div className="analytics-top-container">
          <h1 className="analytics-heading">Quiz Analysis</h1>
        </div>
        <div className="analytics-bottom-container">
          <table>
            <thead className="bg-dark-blue">
              <tr>
                <th className="left-corner">S.No</th>
                <th>Quiz Name</th>
                <th>Created on</th>
                <th>Impression</th>
                <th>Actions</th>
                <th className="right-corner">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {allQuizList.map((quiz, index) => (
                <tr
                  key={quiz._id}
                  className={index % 2 !== 0 ? `bg-light-blue` : ""}
                >
                  <td className="left-corner">{index + 1}</td>
                  <td>{quiz.quizName}</td>
                  <td>{formatDate(quiz.createdAt)}</td>
                  <td>{formatNumber(quiz.impressions)}</td>
                  <td>
                    <button
                      className="action-button edit"
                      onClick={() => handleEditClick(quiz._id)}
                    >
                      <Edit />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(quiz._id)}
                    >
                      <Delete />
                    </button>
                    <button
                      className="action-button share"
                      onClick={() => handleShare(quiz.quizLink)}
                    >
                      <Share />
                    </button>
                  </td>
                  <td className="right-corner">
                    <Link
                      to={
                        quiz.quizType === "POLL"
                          ? `/dashboard/getpollanalytics/${quiz._id}`
                          : `/dashboard/questionanalytics/${quiz._id}`
                      }
                    >
                      Question Wise Analysis
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allQuizList.length === 0 && (
            <p className="no-quiz-message">No quizzes to display</p>
          )}
        </div>
      </div>
      {showModal && (
        <DeleteModal
          show={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          quizId={selectedQuizId}
          loading={loading}
        />
      )}
      {showUpdateModal && (
        <UpdateQuizModal
          show={showUpdateModal}
          setShow={setShowUpdateModal}
          quizId={selectedQuizId}
        />
      )}
    </>
  );
}

export default Analytics;
