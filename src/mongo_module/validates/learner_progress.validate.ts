import Joi from 'joi';

const userId = Joi.string().trim().required();
const sessionId = Joi.string().trim().required().empty();
const subSessionId = Joi.string().trim().required().empty();
const milestoneLevel = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('en','kn','tn','hi','gu','te','or')
    .required();

const createLearnerProgressValidationSchema = Joi.object({
    userId: userId,
    sessionId: sessionId,
    subSessionId: subSessionId,
    language: language,
    milestoneLevel: milestoneLevel,
});

const learnerProgressByuserIdValidationSchema = Joi.object({
    userId: userId,
    language: language,
});
export { createLearnerProgressValidationSchema, learnerProgressByuserIdValidationSchema };
