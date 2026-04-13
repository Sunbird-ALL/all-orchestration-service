import { myDataSource } from "../../config/data.config";
import { Lesson } from "../../schema/lesson";

class lessonSqlService {

    // Sql add lesson
    public static async addLessonSql(lesson: any, next: any) {
        try {
            const lessonData = myDataSource.getRepository(Lesson).create(lesson);
            const results = await myDataSource.getRepository(Lesson).save(lessonData);
            const out = { ...results } as Record<string, unknown>;
            delete out.userId;
            return next(null, out);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    // Sql get lesson
    static async getLessonProgress(userID: any, language: any, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await myDataSource.getRepository(Lesson).find({
                where: { userId: userID, language: language },
                order: { createdAt: 'DESC' }
            });
            if (firstResult.length > 0) {
                const row = { ...firstResult[0] } as Record<string, unknown>;
                delete row.userId;
                result = { result: row };
            } else {
                return next(null, "No data found for this user!");
            }
            next(null, result);
        } catch (err) {
            next("Something went wrong");
        }
    }
}
export default lessonSqlService;
