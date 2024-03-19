import { myDataSource } from "../../config/data.config";
import { Lesson } from "../../schema/lesson";

class lessonSqlService {

    // Sql add lesson
    public static async addLessonSql(lesson: any, next: any) {
        try {
            const lessonData = myDataSource.getRepository(Lesson).create(lesson);
            const results = await myDataSource.getRepository(Lesson).save(lessonData)
            return next(null, results);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    };

    // Sql get lesson
    static async getLessonProgress(userID: any, language: any, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await myDataSource.getRepository(Lesson).find({
                where: { userId: userID, language: language },
                order: { createdAt: 'DESC' }
            });
            if (firstResult.length > 0) {
                result = firstResult[0];
            } else {
                return next(null, "No data found for this user!");
            }
            const response = { result }
            next(null, response);
        } catch (err) {
            console.log("Error:", err);
            next("Something went wrong");
        }
    }
}
export default lessonSqlService;
