import Joi from 'joi';

const userId = Joi.number().integer().required();
const sessionId = Joi.string().trim().required().empty();
const language = Joi.string()
    .trim()
    .valid('ta','en','kn','hi','gu','te','or')
    .required();
const milestone = Joi.string().trim().required().empty();
const milestoneLevel = Joi.string().trim().required().empty();
const subMilestoneLevel = Joi.string().trim().optional().empty();
const lesson = Joi.required().empty();
const progress = Joi.number().min(0).max(100).required()
const duration = Joi.number().min(0).max(10000).optional()
const applyLevel = Joi.string().trim().optional().empty();

const addLessonValidationSchema = Joi.object({
    userId: userId,
    sessionId:sessionId,
    language:language,
    milestone:milestone,
    milestoneLevel:milestoneLevel,
    subMilestoneLevel:subMilestoneLevel,
    lesson:lesson,
    progress:progress,
    duration: duration,
    applyLevel: applyLevel
});

const getLessonProgressValidationSchema = Joi.object({
    userId: userId,
    language:language,
});

export { addLessonValidationSchema, getLessonProgressValidationSchema };

