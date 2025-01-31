import Joi from 'joi';

const userId = Joi.string()
    .trim()
    .required()
    .empty();
const sessionId = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('en', 'kn')
    .required();

const getPointsByUserIdValidationSchema = Joi.object({
    userId: userId,
    sessionId: sessionId,
    language: language,
});

export { getPointsByUserIdValidationSchema };
