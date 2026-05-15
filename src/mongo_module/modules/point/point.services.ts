
import CrudOperations from "../../../common/crud";
import Pointer from "../../models/pointer";


class pointerServices {

    // add pointers
    public static async addPoint(pointer: any, next: any) {
        try {
            const newPointer = new Pointer(pointer);
            let result = await new CrudOperations(Pointer).save(newPointer);

            const userID = result.userId;
            const sessionID = result.sessionId;
            const language = result.language

            result = result.toObject();

            const [aggregated] = await Pointer.aggregate([
                {
                    $facet: {
                        userPoints: [
                            { $match: { userId: userID } },
                            { $group: { _id: null, total: { $sum: "$points" } } }
                        ],
                        sessionPoints: [
                            { $match: { sessionId: sessionID } },
                            { $group: { _id: null, total: { $sum: "$points" } } }
                        ],
                        languagePoints: [
                            { $match: { userId: userID, language: language } },
                            { $group: { _id: null, total: { $sum: "$points" } } }
                        ]
                    }
                }
            ]);

            const totalUserPointer    = aggregated.userPoints[0]?.total    ?? 0;
            const totalSessionPointer = aggregated.sessionPoints[0]?.total ?? 0;
            const totalLanguagePoints = aggregated.languagePoints[0]?.total ?? 0;

            result.totalUserPoints = totalUserPointer;
            result.totalSessionPoints = totalSessionPointer;
            result.totalLanguagePoints = totalLanguagePoints;

            delete result.userId;
           
            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    // get Pointers by userId
    static async getPointsByUserID(userID: any, sessionID: any,language:any, next: CallableFunction) {
        try {
                const [aggregated] = await Pointer.aggregate([
                    {
                        $facet: {
                            userPoints: [
                                { $match: { userId: userID } },
                                { $group: { _id: null, total: { $sum: "$points" } } }
                            ],
                            sessionPoints: [
                                { $match: { sessionId: sessionID } },
                                { $group: { _id: null, total: { $sum: "$points" } } }
                            ],
                            languagePoints: [
                                { $match: { userId: userID, language: language } },
                                { $group: { _id: null, total: { $sum: "$points" } } }
                            ]
                        }
                    }
                ]);

                const totalUserPoints     = aggregated.userPoints[0]?.total    ?? 0;
                const totalSessionPoints  = aggregated.sessionPoints[0]?.total ?? 0;
                const totalLanguagePoints = aggregated.languagePoints[0]?.total ?? 0;

                const response = {
                    totalUserPoints,
                    totalLanguagePoints,
                    totalSessionPoints
                };
                next(null, response);
           
        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default pointerServices;