import { Router } from "express";
import studentController from "./student.controller";
const studentRouter = Router();

studentRouter.post("/register", studentController.uploadStudents);
studentRouter.post("/login", studentController.login);

export default studentRouter;