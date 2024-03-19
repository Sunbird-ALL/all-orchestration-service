
import CrudOperations from "../../../common/crud";
import Lesson from "../../models/lesson";


class lessonServices {
    
    // add pointers
    public static async addLesson(lesson: any, next: any) {
        try {
            const newLesson = new Lesson(lesson);
            console.log("newLesson---", newLesson);
            var result = await new CrudOperations(Lesson).save(newLesson);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    };

    static async getLessonProgress(userID: any, language: any, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await new CrudOperations(Lesson).getAllDocuments({ userId: userID,language: language},{createdAt: -1});
            if(firstResult.length > 0){
                result = firstResult[0];
            }else{
                return next(null, "No data found for this user!");
            }
            const response = {result}
            next(null, response);
        } catch (err) {
            console.log("Error:", err);
            next("Something went wrong");
        }
    }

}
export default lessonServices;