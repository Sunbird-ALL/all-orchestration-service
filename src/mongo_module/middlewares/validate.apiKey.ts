import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKeyEnabled = process.env.API_KEY_ENABLE === 'true';
        const clientApiKey = req.headers['api-key'];
        const validateUrl = process.env.AUTH_SERVICE_API || '';

        if (!apiKeyEnabled) {
            return next();
        }
        if (!clientApiKey || typeof clientApiKey !== 'string') {
            return res.status(401).json({ message: 'API key missing or invalid' });
        }

        const responseFromAuth = await axios.post(validateUrl, { apiKey: clientApiKey });

        if (responseFromAuth.data.isValid === true) {
            return next();
        } else {
            return res.status(401).json({ message: 'Unauthorized: API key invalid' });
        }
    } catch (err) {
        console.error('API key validation error:', err);
        return res.status(500).json({ message: 'Error validating API key' });
    }
};

export default validateApiKey;
