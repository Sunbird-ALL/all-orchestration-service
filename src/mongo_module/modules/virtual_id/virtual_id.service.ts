import { SignJWT } from "jose";
import virtualId from "../../models/user";
import * as jose from 'jose';
import { createHash } from "crypto";



class virtualIdService {

    // MongoDB send virtual_id token
    static async generateId(username: any, version: string, next: CallableFunction) {
        try {
            if (version === 'v1') {
                const lowercaseUname = username.trim().toLowerCase();
                const existingUserName = await virtualId.findOne({ userName: lowercaseUname });
                if (existingUserName) {
                    return next(null, {
                        virtualID: existingUserName.virtualId
                    });

                } else {
                    const virtualID = generateRandomID();
                    const newUser = new virtualId({ userName: lowercaseUname, virtualId: virtualID });
                    await newUser.save();
                    return next(null, {
                        virtualID: virtualID
                    });
                }
            }
            const secret_key = process.env.JOSE_SECRET || '';
            const hash = createHash('sha256').update(secret_key).digest();
            const lowercaseUsername = username.trim().toLowerCase();
            const existingUser = await virtualId.findOne({ userName: lowercaseUsername });

            let virtualID: number;
            if (existingUser) {
                virtualID = existingUser.virtualId;

            } else {
                virtualID = generateRandomID();
                const newUser = new virtualId({ userName: lowercaseUsername, virtualId: virtualID });
                await newUser.save();
            }
            // **Step 1: Sign the JWT Token**
            const jwtSigninKey = new TextEncoder().encode(process.env.JWT_SIGNIN_PRIVATE_KEY);
            const jwtSignedToken = await new jose.SignJWT({ virtual_id: virtualID })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime('30m')
                .sign(jwtSigninKey);


            // **Step 2: Encrypt the Signed JWT Token**
            const jwtEncryptedToken = await new jose.EncryptJWT({ jwtSignedToken })
                .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
                .setExpirationTime('30m')
                .encrypt(hash);

            return next(null, {
                token: jwtEncryptedToken
            });
        } catch (err) {
            return next(err, "Something went wrong!");
        }
    }
}
export default virtualIdService;

// function for generate random_id
function generateRandomID() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}
