import Joi from 'joi';

const score = Joi.number().min(0).max(100).required();
const lessonId = Joi.string().trim().required().empty();
const studentId = Joi.string().trim().required().empty();

const addLearningLogsValidationSchema = Joi.object({
    score: score,
    lessonId: lessonId,
    studentId: studentId
});

const getCumulativeScoreValidationSchema = Joi.object({
    studentId: studentId,
});

const getLessonWiseScoreValidationSchema = Joi.object({
    studentId: studentId,
});


export { addLearningLogsValidationSchema, getCumulativeScoreValidationSchema ,getLessonWiseScoreValidationSchema};

