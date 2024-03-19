import { Point } from "../../schema/point";
import { myDataSource } from "../../config/data.config";

class pointerSqlService {
  // Sql add pointer
  public static async addPointer(points: Point, next: any) {
    try {
      const pointerRepository = myDataSource.getRepository(Point)
      const newPoint = pointerRepository.create(points);
      const result = await pointerRepository.save(newPoint);

      const userId = result.userId;
      const sessionId = result.sessionId;
      const language = result.language

      const pointerUserData = await pointerRepository.find({ where: { userId } });
      const pointerSessionData = await pointerRepository.find({ where: { sessionId } });
      const languageData = await pointerRepository.find({ where: { userId, language } });

      const totalUserPointer = pointerUserData.reduce((total: number, doc: any) => total + parseInt(doc.points) || 0, 0);
      const totalSessionPointer = pointerSessionData.reduce((total: number, doc: any) => total + parseInt(doc.points) || 0, 0);
      const totalLanguagePoints = languageData.reduce((total: number, doc: any) => total + parseInt(doc.points) || 0, 0);

      const resultObject = { ...result, totalUserPoints: totalUserPointer, totalSessionPoints: totalSessionPointer, totalLanguagePoints: totalLanguagePoints };
      return next(null, resultObject);
    } catch (err: any) {
      return next(err, "Something went wrong!");
    }
  };


  // SQl get pointer
  public static async getPointersByUserID(userID: any, sessionID: any, language: any, next: CallableFunction) {
    try {
      const pointerRepository = myDataSource.getRepository(Point);
      const userPointers = await pointerRepository.find({ where: { userId: userID } });
      const totalUserPoints = userPointers.reduce((total: number, doc: Point) => total + parseInt(doc.points) || 0, 0);

      const languagePointers = await pointerRepository.find({ where: { userId: userID, language: language } });
      const totalLanguagePoints = languagePointers.reduce((total: any, pointer: Point) => total + parseInt(pointer.points) || 0, 0);

      const sessionPointers = await pointerRepository.find({ where: { sessionId: sessionID } });
      const totalSessionPoints = sessionPointers.reduce((total: any, pointer: Point) => total + parseInt(pointer.points) || 0, 0);

      const response = {
        totalUserPoints,
        totalLanguagePoints,
        totalSessionPoints,
        result: userPointers,
      };
      next(null, response);
    } catch (err) {
      console.error("Error:", err);
      next("Something went wrong");
    }
  }
}

export default pointerSqlService;
