import Joi from 'joi';

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


const studentsValidationSchema = Joi.object({
    username: username,
});

export { studentsValidationSchema };
