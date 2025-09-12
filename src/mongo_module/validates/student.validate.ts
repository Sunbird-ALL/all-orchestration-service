import Joi from 'joi';

const type = Joi.string()
    .trim()
    .required()
    .valid("single", "bulk")
    .messages({
        "string.base": "Type must be a string",
        "any.required": "Type is required",
        "any.only": "Type must be either 'single' or 'bulk'",
    });

const username = Joi.string()
    .trim()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username cannot be empty",
        "string.pattern.base": "Username must be exactly 11 digits",
        "any.required": "Username is required",
    });

const uploadTypeValidationSchema = Joi.object({
    type: type,
});

const studentsValidationSchema = Joi.object({
    username: username,
});

export { uploadTypeValidationSchema, studentsValidationSchema };
