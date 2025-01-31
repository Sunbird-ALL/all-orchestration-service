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

const milestone = Joi.string().trim().required().empty();
const milestoneLevel = Joi.string().trim().required().empty();
const lesson = Joi.number().required().empty();
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

