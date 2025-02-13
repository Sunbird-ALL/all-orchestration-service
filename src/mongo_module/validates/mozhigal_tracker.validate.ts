import Joi from 'joi';

const score = Joi.number().min(0).max(100).required();
const lessonId = Joi.string().trim().required().empty();
const userId = Joi.number().integer().required();

const addLearningLogsValidationSchema = Joi.object({
    score: score,
    lessonId: lessonId,
    userId: userId
});

const getCumulativeScoreValidationSchema = Joi.object({
    userId: userId,
});

const getLessonWiseScoreValidationSchema = Joi.object({
    userId: userId,
});


export { addLearningLogsValidationSchema, getCumulativeScoreValidationSchema ,getLessonWiseScoreValidationSchema};

