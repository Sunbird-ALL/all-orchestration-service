
import CrudOperations from "../../../common/crud";
import LearnerProgress from "../../models/learnerProgress";


class LearnerProgressServices {
    
    // add pointers
    public static async createLearnerProgress(learnerProgress: any, next: CallableFunction) {
        try {
            const newLearnerProgress = new LearnerProgress(learnerProgress);
            const result = await new CrudOperations(LearnerProgress).save(newLearnerProgress);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    static async getLessonProgress(userID: string, language: any, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await new CrudOperations(LearnerProgress).getDocsWithLimit({ userId: userID,language: language},{createdAt: -1},1);
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
export default LearnerProgressServices;