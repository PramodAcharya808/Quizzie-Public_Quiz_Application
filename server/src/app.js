import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();

// SERVER CONFIGURATION
// app.use(
//   cors({
//     origin: process.env.REACT_FRONTEND,
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);


app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));

app.use(express.static("public/static"));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// API ROUTES
const apiVersion = process.env.API_VERSION;
import userRouter from "./routes/user.route.js";
import quizRouter from "./routes/quiz.route.js";
import analyticRouter from "./routes/analytic.route.js";
import participantRouter from "./routes/participant.route.js";

// API check endpoints
app.get(`${apiVersion}/check/api`, (req, res) => {
  res.json({ message: "API is working", version: apiVersion });
});

// FOR DEVELOPMENT ONLT
if (process.env.ENVIRONMENT === "development") {
  app.get(`${apiVersion}/check/env`, (req, res) => {
    res.json({
      env1: process.env.PORT,
      env2: process.env.MONGODB_URI,
      env3: process.env.API_VERSION,
    });
  });
}

// USER ROUTES
app.use(`${apiVersion}/user`, userRouter);

// QUIZ ROUTES
app.use(`${apiVersion}/quiz`, quizRouter);

// ANALYTIC ROUTES
app.use(`${apiVersion}/analytics`, analyticRouter);

// PARTICIPANT ROUTES
app.use(`${apiVersion}/public`, participantRouter);
