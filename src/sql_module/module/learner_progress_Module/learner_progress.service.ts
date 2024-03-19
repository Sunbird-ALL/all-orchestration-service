import { myDataSource } from "../../config/data.config";
import { learner_progress } from "../../schema/learnerProgress";

class learnerProgressService {

    // Add lesson progress
    public static async addlessonProgress(lessonProgress: learner_progress, next: any) {
        try {
            const lessonProgressData = myDataSource.getRepository("learner_progress").create(lessonProgress);
            const results = await myDataSource.getRepository("learner_progress").save(lessonProgressData)
            return next(null, results);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    };

    // Get latest learner progress by ID
    public static async getLatestLearnerProgressByuserId(id: string, next: any): Promise<learner_progress | undefined> {
        try {
            const lessonProgressRepository = myDataSource.getRepository(learner_progress);
            const latestProgress = await lessonProgressRepository.findOne({ where: { userId: id }, order: { createdAt: 'DESC' } });
            return next(null, latestProgress);
        } catch (err: any) {
            throw new Error("Failed to get latest learner progress. " + err.message);
        }
    }

    // Get learner progress by ID
    public static async getLearnerProgressById(id: number, next: any): Promise<learner_progress | undefined> {
        try {
            const lessonProgressRepository = myDataSource.getRepository(learner_progress);
            const progress = await lessonProgressRepository.find({ where: { id: id } });
            return next(null, progress);
        } catch (err: any) {
            throw new Error("Failed to get learner progress. " + err.message);
        }
    }

    // Get learner progress by user ID
    public static async getLearnerProgressByUserId(userId: string, next: any): Promise<learner_progress[]> {
        try {
            const lessonProgressRepository = myDataSource.getRepository(learner_progress);
            const progress = await lessonProgressRepository.find({ where: { userId } });
            return next(null, progress);
        } catch (err: any) {
            throw new Error("Failed to get learner progress by user ID. " + err.message);
        }
    }

    // Get learner progress by session ID
    public static async getLearnerProgressBySessionId(sessionId: string, next: any): Promise<learner_progress[]> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            const progress = await lessonProgressRepository.find({ where: { sessionId: sessionId } });
            return next(null, progress);
        } catch (err: any) {
            throw new Error("Failed to get learner progress by session ID. " + err.message);
        }
    }

    // Get learner progress by sub-session ID
    public static async getLearnerProgressBySubSessionId(subSessionId: string, next: any): Promise<learner_progress[]> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            const progress = await lessonProgressRepository.find({ where: { subSessionId: subSessionId } });
            return next(null, progress);
        } catch (err: any) {
            throw new Error("Failed to get learner progress by sub-session ID. " + err.message);
        }
    }

    // Update learner progress by ID
    public static async updateLearnerProgressById(id: number, newProgressData: Partial<learner_progress>, next: any): Promise<learner_progress | undefined> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            const updatedProgress = await lessonProgressRepository.update({ id: id }, newProgressData);
            return next(null, updatedProgress);
        } catch (err: any) {
            throw new Error("Failed to update learner progress by user ID. " + err.message);
        }
    }

    // Update learner progress by user ID
    public static async updateLearnerProgressBysubsessionId(id: string, newProgressData: Partial<learner_progress>, next: any): Promise<learner_progress | undefined> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            const updatedProgress = await lessonProgressRepository.update({ subSessionId: id }, newProgressData);
            return next(null, updatedProgress);
        } catch (err: any) {
            throw new Error("Failed to update learner progress by user ID. " + err.message);
        }
    }

    // Delete learner progress by ID
    public static async deleteLearnerProgressById(id: string, next: any): Promise<void> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            await lessonProgressRepository.delete({ id: id });
            return next(null, `Deleted id - ${id} entry`);
        } catch (err: any) {
            throw new Error("Failed to delete learner progress by user ID. " + err.message);
        }
    }

    // Delete learner progress by user ID
    public static async deleteLearnerProgressByUserId(userId: string, next: any): Promise<void> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            await lessonProgressRepository.delete({ userId: userId });
            return next(null, `Deleted user id - ${userId} entry`);
        } catch (err: any) {
            throw new Error("Failed to delete learner progress by user ID. " + err.message);
        }
    }

    // Delete learner progress by sub-session ID
    public static async deleteLearnerProgressBySubSessionId(subSessionId: string, next: any): Promise<void> {
        try {
            const lessonProgressRepository = myDataSource.getRepository("learner_progress");
            await lessonProgressRepository.delete({ subSessionId: subSessionId });
            return next(null, `Deleted sub session id - ${subSessionId} entry`);
        } catch (err: any) {
            throw new Error("Failed to delete learner progress by sub-session ID. " + err.message);
        }
    }

}

export default learnerProgressService;
