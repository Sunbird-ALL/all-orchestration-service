import virtualId from "../../models/user";


class virtualIdService {
    // MongoDB send virtual_id

    static async generateId(username: any, next: CallableFunction) {
        try {
            const lowercaseUsername = username.trim().toLowerCase();
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername });
            if (existingUser) {
                return next(null, {
                    virtualID: existingUser.virtualId
                });
            } else {
                const virtualID = generateRandomID();
                const newUser = new virtualId({ userName: lowercaseUsername, virtualId: virtualID });
                await newUser.save();
                return next(null, {
                    virtualID: virtualID
                });
            }
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }
}

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}
export default virtualIdService;
