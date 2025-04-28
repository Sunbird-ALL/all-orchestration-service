
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

            const pointerUserData = await new CrudOperations(Pointer).getAllDocuments({ userId: userID }, {},{});
            const pointerSessionData = await new CrudOperations(Pointer).getAllDocuments({ sessionId: sessionID }, {},{});
            const languageData = await new CrudOperations(Pointer).getAllDocuments({ userId: userID , language: language}, {},{});
            
            result = result.toObject();

            const totalUserPointer = pointerUserData.reduce((total: any, doc: any) => total + (doc.points || 0), 0);
            const totalSessionPointer = pointerSessionData.reduce((total: any, doc: any) => total + (doc.points || 0), 0);
            const totalLanguagePoints = languageData.reduce((total: any, doc: any) => total + (doc.points || 0), 0);

            result.totalUserPoints = totalUserPointer;
            result.totalSessionPoints = totalSessionPointer;
            result.totalLanguagePoints = totalLanguagePoints;

            return next(null, result);
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    }

    // get Pointers by userId
    static async getPointsByUserID(userID: any, sessionID: any,language:any, next: CallableFunction) {
        try {
                const result = await new CrudOperations(Pointer).getAllDocuments({ userId: userID }, {},{});
                const totalUserPoints = result.reduce((total: any, doc: any) => total + (doc.points || 0), 0);

                const languageData = await new CrudOperations(Pointer).getAllDocuments({ userId: userID , language: language}, {},{});
                const totalLanguagePoints = languageData.reduce((total: any, doc: any) => total + (doc.points || 0), 0);

                const sessionData = await new CrudOperations(Pointer).getAllDocuments({ sessionId: sessionID }, {},{});
                const totalSessionPoints = sessionData.reduce((total: any, doc: any) => total + (doc.points || 0), 0);

                const response = {
                    userID,
                    totalUserPoints,
                    totalLanguagePoints,
                    totalSessionPoints,
                    result,
                }
                next(null, response);
           
        } catch (err) {
            next("Something went wrong");
        }
    }

}
export default pointerServices;