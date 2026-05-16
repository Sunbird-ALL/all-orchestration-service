
import CrudOperations from "../../../common/crud";
import Pointer from "../../models/pointer";


class pointerServices {

    private static async aggregatePoints(userID: any, language: any) {
    
        const [userResult, languageResult] = await Promise.all([
            Pointer.aggregate([
                { $match: { userId: userID } },
                { $group: { _id: null, total: { $sum: "$points" } } }
            ]),
            Pointer.aggregate([
                { $match: { userId: userID, language: language } },
                { $group: { _id: null, total: { $sum: "$points" } } }
            ])
        ]);

        return {
            totalUserPoints: userResult[0]?.total ?? 0,
            totalLanguagePoints: languageResult[0]?.total ?? 0
        };
    }

    // add pointers
    public static async addPoint(pointer: any, next: any) {
        try {
            const newPointer = new Pointer(pointer);
            let result = await new CrudOperations(Pointer).save(newPointer);

            const userID = result.userId;
            const language = result.language;

            result = result.toObject();

            const { totalUserPoints, totalLanguagePoints } =
                await pointerServices.aggregatePoints(userID, language);

            result.totalUserPoints = totalUserPoints;
            result.totalLanguagePoints = totalLanguagePoints;

            delete result.userId;

            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    // get Pointers by userId
    static async getPointsByUserID(userID: any, sessionID: any, language: any, next: CallableFunction) {
        try {
            const response = await pointerServices.aggregatePoints(userID, language);
            next(null, response);
        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default pointerServices;