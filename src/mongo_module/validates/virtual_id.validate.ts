import Joi from 'joi';

const username = Joi.string()
    .trim()
    .required()
    .empty();


const genarateVirtualIdValidationSchema = Joi.object({
    username: username,
});

export { genarateVirtualIdValidationSchema };
