import { Router } from "express";
import {
  getQuizData,
  getResponse,
} from "../controller/participant.controller.js";

const participantRouter = Router();

participantRouter.route("/quiz/:quizLink").get(getQuizData);
participantRouter.route("/quiz/start").post(getResponse);

export default participantRouter;
