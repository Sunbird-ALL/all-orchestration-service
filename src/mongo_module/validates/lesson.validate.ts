import Joi from 'joi';

const userId = Joi.number().integer().required();
const sessionId = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('en','kn','tn','hi','gu','te','or')
    .required();
const milestone = Joi.string().trim().required().empty();
const milestoneLevel = Joi.string().trim().required().empty();
const lesson = Joi.string().required().empty();
const progress = Joi.number().required().empty();

const addLessonValidationSchema = Joi.object({
    userId: userId,
    sessionId:sessionId,
    language:language,
    milestone:milestone,
    milestoneLevel:milestoneLevel,
    lesson:lesson,
    progress:progress,
});

const getLessonProgressValidationSchema = Joi.object({
    userId: userId,
    language:language,
});

export { addLessonValidationSchema, getLessonProgressValidationSchema };

