import { Router } from "express";
import lessonRouter from "./lesson/lesson.router";
import mongoose from "mongoose";
import virtualIRouter from "./virtual_id/virtual_id.router";
import pointerRouter from "./point/point.router";
import learnerProgressRouter from "./learner_progress/learner_progress.router";
import adaptiveLearningRouter from "./adaptiveLearning/adaptive_learning.router";
import mozhigalTracker from "./mozhigal_tracker/mozhigal_tracker.router";
import studentRouter from "./student/student.router";
import clientErrorsRouter from "./client_errors/client_errors.router";

const MONGO_URL: string = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/lesson_points_tracker';

const mongoDbRouter = Router();

mongoDbRouter.use("/pointer", pointerRouter);

mongoDbRouter.use("/lesson", lessonRouter);

mongoDbRouter.use("/virtualId",virtualIRouter);

mongoDbRouter.use("/learnerProgress", learnerProgressRouter);

mongoDbRouter.use("/adaptiveLearning", adaptiveLearningRouter);

mongoDbRouter.use("/tracker", mozhigalTracker);

mongoDbRouter.use("/student", studentRouter);

mongoDbRouter.use("/client-errors", clientErrorsRouter);

// MongoDb connection
export async function mongodbConnection(): Promise<void> {
    mongoose.set('strictQuery', false);
    try {
        // Connections per process. Total on MongoDB = POOL_SIZE x workers x pods.
        // Unset keeps the driver defaults (max 100, min 0).
        await mongoose.connect(MONGO_URL, {
            maxPoolSize: parseInt(process.env.POOL_SIZE || '', 10) || 100,
            minPoolSize: parseInt(process.env.MIN_POOL_SIZE || '', 10) || 0,
        });
        console.log("\n*************MONGODB connected**************\n");
    } catch (error) {
        console.error("unable to connect with database:", error);
        throw new Error("MONGODB_CONNECTION_FAILED");
    }
}

export default mongoDbRouter;