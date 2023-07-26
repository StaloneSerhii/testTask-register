const Joi = require("joi");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const emailShemas = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const schemasAuth = {
  registerSchema,
  loginSchema,
  emailShemas,
};

module.exports = { schemasAuth };
