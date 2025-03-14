
import CrudOperations from "../../../common/crud";
import BaselineAssessment from "../../models/baseline_assess";


class BaselineService {
    public static async addBaseline(Baseline: any, next: any) {
        try {
            const student_id = Baseline.student_id;
            const assessment_id = Baseline.assessment_id;

            const alreadySubmit = await new CrudOperations(BaselineAssessment).getAllDocuments({ studentId: student_id, assessmentId: assessment_id }, {}, {});
            if (alreadySubmit.length > 0) {
                return next(null, "Baseline Quiz already submitted by this student");
            }

            const newBaseline = new BaselineAssessment(Baseline);
            let result = await new CrudOperations(BaselineAssessment).save(newBaseline);
            result = result.toObject();

            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    public static async getBaseline(student_id: String, assessment_Id: String, next: any) {
        try {
            // if assessment_id then send the data with the assessment
            if (assessment_Id) {
                const assessmentData = await new CrudOperations(BaselineAssessment).getAllDocuments({ student_id: student_id, assessment_id: assessment_Id }, {}, {});
                return next(null, assessmentData);
            } else {
                const studentData = await new CrudOperations(BaselineAssessment).getAllDocuments({ student_id: student_id }, {}, {});
                return next(null, studentData);
            }
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

}
export default BaselineService;