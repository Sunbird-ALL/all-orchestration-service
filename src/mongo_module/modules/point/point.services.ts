
import CrudOperations from "../../../common/crud";
import Pointer from "../../models/pointer";


class pointerServices {

    // add point
    public static async addPoint(pointer: any, next: any) {
        try {
            const newPointer = new Pointer(pointer);
            let result = await new CrudOperations(Pointer).save(newPointer);

            const userID = result.userId;
            const language = result.language;

            const [agg] = await Pointer.aggregate([
                { $match: { userId: userID, language: language } },
                { $group: { _id: null, total: { $sum: "$points" } } }
            ]);

            result = result.toObject();
            result.totalLanguagePoints = agg?.total || 0;
            delete result.userId;

            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    // get Point by userId
    static async getPointsByUserID(userID: any, sessionID: any, language: any, next: CallableFunction) {
        try {
            const [agg] = await Pointer.aggregate([
                { $match: { userId: userID, language: language } },
                { $group: { _id: null, total: { $sum: "$points" } } }
            ]);

            next(null, { totalLanguagePoints: agg?.total || 0 });

        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default pointerServices;