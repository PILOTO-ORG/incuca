const Joi = require('joi')

/**
 * Schema de validação para login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'any.required': 'Senha é obrigatória'
    })
})

/**
 * Schema de validação para refresh token
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token é obrigatório'
    })
})

module.exports = {
  loginSchema,
  refreshTokenSchema
}
