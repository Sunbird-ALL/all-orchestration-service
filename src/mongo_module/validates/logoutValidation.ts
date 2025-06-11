import Joi from 'joi';


const logoutValidationSchema = Joi.object({
    token: Joi.string().required()
});

export {logoutValidationSchema}