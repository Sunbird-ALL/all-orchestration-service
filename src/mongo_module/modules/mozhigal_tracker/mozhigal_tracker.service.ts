
import CrudOperations from "../../../common/crud";
import learningLogs from "../../models/mozhigalScoreTracker";
import emisLessonMaster from "../../models/emisLessonMaster";


class MozhigalTrackerServices {

    public static async addLearningLogs(learningLogsData: any, lessonId: any,studentId:any, next: CallableFunction) {
        try {
            const resultData = await new CrudOperations(emisLessonMaster).getDocument({ lesson_id: lessonId }, {});
            if (!resultData) {
                return next(null, "No record found for this lesson_id");
            }
            learningLogsData["lesson_master_id"] = resultData.lesson_master_id;
            learningLogsData["student_id"] = studentId;
            const newData = new learningLogs(learningLogsData);
            const result = await new CrudOperations(learningLogs).save(newData);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    public static async getCumulativeScore(studentId: any, next: CallableFunction) {
        try {
            const result = await new CrudOperations(learningLogs).cummumulativeScoreDocument(studentId);
            if (result.length === 0 || result[0].totalScore === null) {
                return next(null, 'Student not found or no scores available');
            }
            const totalScore = result[0].totalScore
            return next(null, {studentId,totalScore});
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    public static async getLessonWiseScore(studentId: any, next: CallableFunction) {
        try {
            const result = await new CrudOperations(learningLogs).lessonWiseScoreDocument(studentId);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

}
export default MozhigalTrackerServices;