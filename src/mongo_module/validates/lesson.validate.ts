import Joi from 'joi';

const userId = Joi.string()
    .trim()
    .required()
    .empty();
const sessionId = Joi.string().trim().required().empty();
const milestone = Joi.string().trim().required().empty();
const progress = Joi.number().required().empty();
const lesson = Joi.string().trim().required().empty();
const milestoneLevel = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('en', 'kn')
    .required();

const addLessonValidationSchema = Joi.object({
    userId: userId,
    sessionId: sessionId,
    milestone: milestone,
    progress: progress,
    lesson: lesson,
    milestoneLevel: milestoneLevel,
    language: language,

});


const getLessonProgressValidationSchema = Joi.object({
    userId: userId,
    language: language,
});


export { addLessonValidationSchema, getLessonProgressValidationSchema };
