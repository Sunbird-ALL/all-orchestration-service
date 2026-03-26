import { Router } from "express";
import { asyncRoute } from "../../../common/middleware/api-error.middleware";
import studentController from "./student.controller";
const studentRouter = Router();

studentRouter.post("/register", asyncRoute(studentController.uploadStudents));
studentRouter.post("/login", asyncRoute(studentController.login));

export default studentRouter;