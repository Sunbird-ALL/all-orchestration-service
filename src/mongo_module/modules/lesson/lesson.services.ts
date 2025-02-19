
import CrudOperations from "../../../common/crud";
import Lesson from "../../models/lesson";


class lessonServices {
    
    // add pointers
    public static async addLesson(lesson: any, next: CallableFunction) {
        try {
            const newLesson = new Lesson(lesson);
            const result = await new CrudOperations(Lesson).save(newLesson);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    static async getLessonProgress(userID: string, language: any, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await new CrudOperations(Lesson).getAllDocuments({ userId: userID,language: language},{createdAt: -1},1);
            
            let final = {};
            final = firstResult[0];

            if(final){
                result = final;
            }else{
                return next(null, "No data found for this user!");
            }
            const response = result
            next(null, response);
        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default lessonServices;