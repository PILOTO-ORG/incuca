import Joi from 'joi';

/**
 * Joke Validation Schemas
 *
 * Esquemas de validação para endpoints de piadas
 * Implementa validação robusta para parâmetros de consulta
 */

// Constants
const MAX_JOKES_PER_REQUEST = 10;
const MIN_JOKES_PER_REQUEST = 1;

// Custom validation messages
const VALIDATION_MESSAGES = {
  'number.base': '{#label} deve ser um número',
  'number.integer': '{#label} deve ser um número inteiro',
  'number.min': '{#label} deve ser pelo menos {#limit}',
  'number.max': '{#label} deve ser no máximo {#limit}',
  'string.base': '{#label} deve ser um texto',
  'string.empty': '{#label} não pode estar vazio',
  'any.only': '{#label} deve ser um dos valores permitidos: {#valids}'
};

/**
 * Schema para validação de contagem de piadas
 */
export const jokeCountSchema = Joi.number()
  .integer()
  .min(MIN_JOKES_PER_REQUEST)
  .max(MAX_JOKES_PER_REQUEST)
  .default(3)
  .label('Número de piadas')
  .messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de query parameters de múltiplas piadas
 */
export const multipleJokesQuerySchema = Joi.object({
  count: jokeCountSchema,
  format: Joi.string()
    .valid('json', 'text')
    .default('json')
    .label('Formato de resposta')
    .messages(VALIDATION_MESSAGES),
  cache: Joi.boolean()
    .default(true)
    .label('Usar cache')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de query parameters de piada aleatória
 */
export const randomJokeQuerySchema = Joi.object({
  format: Joi.string()
    .valid('json', 'text')
    .default('json')
    .label('Formato de resposta')
    .messages(VALIDATION_MESSAGES),
  cache: Joi.boolean()
    .default(true)
    .label('Usar cache')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de query parameters de estatísticas
 */
export const statsQuerySchema = Joi.object({
  detailed: Joi.boolean()
    .default(false)
    .label('Estatísticas detalhadas')
    .messages(VALIDATION_MESSAGES),
  period: Joi.string()
    .valid('day', 'week', 'month', 'year', 'all')
    .default('all')
    .label('Período de estatísticas')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de parâmetros de cache
 */
export const cacheParamsSchema = Joi.object({
  action: Joi.string()
    .valid('clear', 'refresh', 'stats')
    .required()
    .label('Ação do cache')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de filtros avançados (futuro)
 */
export const jokeFiltersSchema = Joi.object({
  category: Joi.string()
    .valid('programming', 'general', 'dev', 'tech')
    .label('Categoria')
    .messages(VALIDATION_MESSAGES),
  minLength: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .label('Tamanho mínimo')
    .messages(VALIDATION_MESSAGES),
  maxLength: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .label('Tamanho máximo')
    .messages(VALIDATION_MESSAGES),
  language: Joi.string()
    .valid('en', 'pt', 'es', 'fr')
    .default('en')
    .label('Idioma')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de feedback de piadas (futuro)
 */
export const jokeFeedbackSchema = Joi.object({
  jokeId: Joi.string()
    .required()
    .label('ID da piada')
    .messages(VALIDATION_MESSAGES),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .label('Avaliação')
    .messages(VALIDATION_MESSAGES),
  comment: Joi.string()
    .max(500)
    .label('Comentário')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);

/**
 * Schema para validação de busca de piadas (futuro)
 */
export const jokeSearchSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .max(100)
    .required()
    .label('Termo de busca')
    .messages(VALIDATION_MESSAGES),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .label('Limite de resultados')
    .messages(VALIDATION_MESSAGES),
  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .label('Offset de paginação')
    .messages(VALIDATION_MESSAGES)
}).messages(VALIDATION_MESSAGES);
