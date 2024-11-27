
import CrudOperations from "../../../common/crud";
import adaptiveLearning from "../../models/adaptiveLearning";


class AdaptiveLearningServices {

    public static async addSchoolUdise(schoolData: any, next: CallableFunction) {
        try {
            const newData = new adaptiveLearning(schoolData);
            const alreadyData = await new CrudOperations(adaptiveLearning).getDocument({ udise_code: schoolData.udise_code }, {});
            if (alreadyData) {
                return next(null, "udise_code is already exists");
            }
            const result = await new CrudOperations(adaptiveLearning).save(newData);
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    static async validateUdise(udiseCode: string, next: CallableFunction) {
        try {
            let result = {};
            const firstResult = await new CrudOperations(adaptiveLearning).getDocument({ udise_code: udiseCode }, {});
            if (firstResult) {
                result = { status: true }
            } else {
                result = { status: false}
            }
            next(null, result);
        } catch (err) {
            console.log("Error:", err);
            next("Something went wrong");
        }
    }

    public static async deleteUdise(udiseCode: string, next: CallableFunction) {
        try {
            const firstResult = await new CrudOperations(adaptiveLearning).getDocument({ udise_code: udiseCode }, {});
            if (!firstResult) {
                return next(null, "No record found to delete");
            } else {
                await new CrudOperations(adaptiveLearning).deleteDocument({ udise_code: udiseCode});
                return next(null, "record deleted successfully!");
            }
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    static async getAllUdeise(next: CallableFunction) {
        try {
            const allRecord = await new CrudOperations(adaptiveLearning).getAllDocuments({}, {},{});
            next(null, allRecord);
        } catch (err) {
            console.log("Error:", err);
            next("Something went wrong");
        }
    }
}
export default AdaptiveLearningServices;