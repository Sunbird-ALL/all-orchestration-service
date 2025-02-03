import { SignJWT } from "jose";
import virtualId from "../../models/user";


class virtualIdService {
    // MongoDB send virtual_id

    static async generateId(username: any, next: CallableFunction) {
        try {
            interface CustomJwtPayload {
                virtual_id: Number
            };
            let joseToken = "";
            const lowercaseUsername = username.trim().toLowerCase();
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername });
            if (existingUser) {
                const user_data:CustomJwtPayload = {
                    virtual_id:existingUser.virtualId
                };
                const token = await createJOSEToken(user_data);
                joseToken = token;

            } else {
                const virtualID = generateRandomID();
                const newUser = new virtualId({ userName: lowercaseUsername, virtualId: virtualID });
                await newUser.save();

                const user_data:CustomJwtPayload = {
                    virtual_id:virtualID
                };
                const token = await createJOSEToken(user_data);
                joseToken = token;
                
            }
            return next(null, {
                token: joseToken
            });
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }
}

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

// generate JOSE token
 async function createJOSEToken(userData: any) {
        try {
            const secretKey = process.env.JOSE_SECRET;

            // Create the JWS (JOSE) token
            const token = await new SignJWT(userData)
                .setProtectedHeader({ alg: 'HS256' })
                .sign(new TextEncoder().encode(secretKey));

            return token;
        } catch (error) {
            console.error("Error creating JOSE token:", error);
            throw new Error("Failed to create JOSE token");
        }
    }
export default virtualIdService;


