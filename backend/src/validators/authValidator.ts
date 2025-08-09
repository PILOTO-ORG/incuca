import Joi from 'joi';

/**
 * Schema de validação para login
 */
export const loginSchema = Joi.object({
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
});

/**
 * Schema de validação para refresh token
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token é obrigatório'
    })
});

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      'any.required': 'Senha é obrigatória'
    })
});

/**
 * Schema de validação para atualização de perfil
 */
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Email deve ter um formato válido'
    })
});

/**
 * Schema de validação para alteração de senha
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha atual é obrigatória'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      'any.required': 'Nova senha é obrigatória'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirmação de senha deve ser igual à nova senha',
      'any.required': 'Confirmação de senha é obrigatória'
    })
});
