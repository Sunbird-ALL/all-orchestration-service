import crypto from 'crypto';
import HttpException from '../../common/http.Exception/http.Exception';

const algorithm = 'aes-256-cbc';
const iterations = 100_000;
const keyLength = 32;
const ivLength = 16;

const password: string | undefined = process.env.DATA_ENCRYPT_SECRET_KEY;
const saltHex: string | undefined = process.env.DATA_ENCRYPT_SALT_VALUE;

if (!password || !saltHex) {
    throw new HttpException(400, 'Encryption key or salt is missing from environment variables.');
}

const salt: Buffer = Buffer.from(saltHex, 'hex');

async function deriveKeyAndIV(): Promise<{ key: Buffer; iv: Buffer }> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password as string, salt, iterations, keyLength, 'sha256', (err, key) => {
            if (err) {
                reject(new HttpException(500, 'Error deriving key.'));
                return;
            }
            const iv = key.subarray(0, ivLength);
            resolve({ key, iv });
        });
    });
}

async function encryptData(plainText: string | number): Promise<string> {
    if (typeof plainText !== 'string' && typeof plainText !== 'number') {
        throw new HttpException(400, 'Invalid data type. Encryption supports only strings or numbers.');
    }

    const { key, iv } = await deriveKeyAndIV();

    return new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(plainText.toString(), 'utf8');
        encryptedData = Buffer.concat([encryptedData, cipher.final()]);
        resolve(encryptedData.toString('hex'));
    });
}

async function decryptData(encryptedText: string): Promise<string> {
    if (typeof encryptedText !== 'string') {
        throw new HttpException(400, 'Invalid encrypted data format.');
    }

    const { key, iv } = await deriveKeyAndIV();

    return new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decryptedData = decipher.update(Buffer.from(encryptedText, 'hex'));
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);
        resolve(decryptedData.toString());
    });
}

export { encryptData, decryptData };
