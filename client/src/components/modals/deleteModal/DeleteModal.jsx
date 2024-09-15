import React from "react";
import "./DeleteModal.css";
import Loader from "../../loader/Loader";

const DeleteModal = ({ show, onClose, onConfirm, quizId, loading }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        {loading && <Loader />}
        <div className="modal-content">
          <h2>Are you confirm you want to delete ?</h2>

          <div className="modal-actions">
            <button
              onClick={() => onConfirm(quizId)}
              className="confirm-button"
            >
              Confirm Delete
            </button>
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteModal;
