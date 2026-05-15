
import CrudOperations from "../../../common/crud";
import Pointer from "../../models/pointer";


class pointerServices {

    private static async aggregatePoints(userID: any, sessionID: any, language: any) {
        const [[aggregated], sessionResult] = await Promise.all([
            Pointer.aggregate([
                { $match: { userId: userID } },
                {
                    $facet: {
                        userPoints: [
                            { $group: { _id: null, total: { $sum: "$points" } } }
                        ],
                        languagePoints: [
                            { $match: { language: language } },
                            { $group: { _id: null, total: { $sum: "$points" } } }
                        ]
                    }
                }
            ]),
            Pointer.aggregate([
                { $match: { sessionId: sessionID } },
                { $group: { _id: null, total: { $sum: "$points" } } }
            ])
        ]);

        return {
            totalUserPoints: aggregated.userPoints[0]?.total ?? 0,
            totalSessionPoints: sessionResult[0]?.total ?? 0,
            totalLanguagePoints: aggregated.languagePoints[0]?.total ?? 0
        };
    }

    // add pointers
    public static async addPoint(pointer: any, next: any) {
        try {
            const newPointer = new Pointer(pointer);
            let result = await new CrudOperations(Pointer).save(newPointer);

            const userID = result.userId;
            const sessionID = result.sessionId;
            const language = result.language;

            result = result.toObject();

            const { totalUserPoints, totalSessionPoints, totalLanguagePoints } =
                await pointerServices.aggregatePoints(userID, sessionID, language);

            result.totalUserPoints = totalUserPoints;
            result.totalSessionPoints = totalSessionPoints;
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
            const response = await pointerServices.aggregatePoints(userID, sessionID, language);
            next(null, response);
        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default pointerServices;