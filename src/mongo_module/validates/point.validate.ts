import Joi from 'joi';

const userId = Joi.string()
    .trim()
    .required()
    .empty();
const sessionId = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('en','kn','tn','hi','gu','te')
    .required();

const milestone = Joi.string().trim().required().empty();
const points = Joi.number().required();

const getPointsByUserIdValidationSchema = Joi.object({
    userId: userId,
    sessionId: sessionId,
    language: language,
});

const addPointValidationSchema = Joi.object({
    userId: userId,
    sessionId: sessionId,
    language: language,
    milestone: milestone,
    points: points
});

export { getPointsByUserIdValidationSchema , addPointValidationSchema};
