# 📚 Documentação da API - Incuca Geek Jokes

## 🚀 Visão Geral

Esta documentação descreve todos os endpoints disponíveis na API do projeto Incuca Geek Jokes.

**Base URL:** `http://localhost:3001/api`

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Todos os endpoints protegidos requerem o header:

```
Authorization: Bearer <access_token>
```

## 📡 Endpoints

### 🔑 Autenticação

#### POST /auth/login
Realiza login do usuário.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Erros:**
- `400`: Dados inválidos
- `401`: Credenciais incorretas
- `500`: Erro interno do servidor

---

#### POST /auth/logout
Realiza logout do usuário (requer autenticação).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

#### POST /auth/refresh
Atualiza o access token usando o refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "Tokens atualizados com sucesso"
}
```

**Erros:**
- `401`: Refresh token inválido ou expirado

---

### 😂 Piadas

#### GET /jokes/random
Busca uma piada aleatória (requer autenticação).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "type": "string",
    "setup": "string",
    "punchline": "string",
    "cached": "boolean",
    "timestamp": "datetime"
  },
  "message": "Piada obtida com sucesso"
}
```

**Tipos de Piada:**
- `single`: Piada de uma linha
- `twopart`: Piada com setup e punchline

**Erros:**
- `401`: Token inválido ou expirado
- `429`: Muitas requisições (rate limit)
- `503`: Serviço externo indisponível

---

#### GET /jokes/stats
Retorna estatísticas de uso de piadas (requer autenticação).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRequests": "number",
    "cacheHits": "number",
    "cacheMisses": "number",
    "popularTypes": [
      {
        "type": "string",
        "count": "number"
      }
    ],
    "lastRequest": "datetime"
  },
  "message": "Estatísticas obtidas com sucesso"
}
```

---

## 🔗 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autorizado |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro interno |
| 503 | Service Unavailable - Serviço indisponível |

## 🚦 Rate Limiting

- **Autenticação:** 5 tentativas por minuto por IP
- **Piadas:** 30 requisições por minuto por usuário
- **Refresh Token:** 10 tentativas por hora por usuário

## 📝 Formato de Resposta Padrão

Todas as respostas seguem o padrão:

```json
{
  "success": "boolean",
  "data": "object|array|null",
  "message": "string",
  "error": "string|null" // Apenas em caso de erro
}
```

## 🧪 Dados de Teste

Para desenvolvimento e testes, utilize:

**Usuário de Teste:**
- Email: `test@incuca.com`
- Senha: `123456`

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/incuca"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_REFRESH_SECRET="seu-refresh-secret-super-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# API Externa
JOKES_API_URL="https://v2.jokeapi.dev"

# Servidor
PORT=3001
NODE_ENV="development"

# Cache
CACHE_TTL=300000
CACHE_CHECK_PERIOD=60000
```

## 🛡️ Segurança

- Todos os passwords são hasheados com bcrypt
- Tokens JWT com expiração configurável
- Rate limiting por endpoint
- Validação de dados de entrada
- Headers de segurança configurados

## 📊 Monitoramento

A API fornece logs estruturados para:
- Requests HTTP
- Autenticação
- Erros de aplicação
- Performance de cache
- Uso de APIs externas

## 🐛 Tratamento de Erros

Erros são retornados no formato:

```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem amigável para o usuário",
  "data": null
}
```

## 📈 Versionamento

A API segue versionamento semântico:
- **Major:** Mudanças incompatíveis
- **Minor:** Novas funcionalidades compatíveis
- **Patch:** Correções de bugs

**Versão Atual:** `v1.0.0`

## 🤝 Suporte

Para dúvidas ou problemas:
- Criar issue no repositório
- Consultar logs da aplicação
- Verificar status dos serviços externos

---

*Documentação atualizada em: {{ new Date().toLocaleDateString('pt-BR') }}*
