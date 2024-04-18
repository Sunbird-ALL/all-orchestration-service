import { myDataSource } from "../../config/data.config";
import { virtualId } from "../../schema/user";

class virtualIdSqlSqlService {

    // Sql send virtual_id
    public static async genarateId(username: any, next: CallableFunction) {
        try {
            const userRepository = myDataSource.getRepository(virtualId);
            const lowercaseUsername = username.toLowerCase();

            const existingUser = await userRepository.findOne({ where: { userName: lowercaseUsername } });
            if (existingUser) {
                return next(null, {
                    virtualID: existingUser.virtualId
                });
            } else {
                const virtualID = generateRandomID();
                const newUser = userRepository.create({ userName: lowercaseUsername, virtualId: virtualID.toString() });
                await userRepository.save(newUser);
                return next(null, {
                    virtualID: virtualID
                });
            }
        } catch (err: any) {
            return next(err, "Something went wrong!");
        }
    };

}
// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}
export default virtualIdSqlSqlService;
