import Joi from 'joi';

const udise_code = Joi.string().trim().required().empty();

const school_name = Joi.string().trim().required().empty();

const addSchoolUdiseValidationScheme = Joi.object({
    udise_code: udise_code,
    school_name: school_name
});

const deleteUdiseValidationScheme = Joi.object({
    udise_code: udise_code
});

const validateUdiseValidationScheme = Joi.object({
    udise_code: udise_code
});

export { addSchoolUdiseValidationScheme, deleteUdiseValidationScheme, validateUdiseValidationScheme };