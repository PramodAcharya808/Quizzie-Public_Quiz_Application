import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 className="logo404 secondary-font">QUIZZIE</h1>
      <br />
      <br />
      <h1>404 - Not Found</h1>
      <br />
      <br />
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        You can always go back to the{" "}
        <Link to="/">
          <span className="span404">Dashboard</span>
        </Link>
        .
      </p>
    </div>
  );
};

export default NotFound;
