# Teste Fullstack - Incuca
## SPA das Piadas Geek 🤖😄

Uma aplicação Single Page Application que brinca com o humor usando piadas geek da API pública conforme especificação do teste Incuca.

## 📋 Descrição do Projeto

A aplicação implementa o fluxo exato solicitado no teste:
- **Login**: Autenticação com validação de email e senha (mín. 8 caracteres)
- **Inicial** (`/inicial`): Estado neutro 😐 - primeiro clique leva para /triste
- **Triste** (`/triste`): Estado triste 😢 - clique leva para /poker-face
- **Poker Face** (`/poker-face`): Carrega piada da API e mostra modal 😑
- **Feliz** (`/feliz`): Estado feliz após ler a piada 😄 - fecha modal e volta para /inicial

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework reativo
- **Vuetify 3** - Biblioteca de componentes Material Design
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP
- **ESLint + Prettier** - Análise estática de código

### Backend
- **Node.js + Express.js + TypeScript** - API REST (justificativa: performance, ecossistema npm, type-safety)
- **JWT (jsonwebtoken)** - Autenticação
- **Prisma ORM** - Migrations automáticas e type-safety
- **PostgreSQL** - Banco de dados (migrado do MySQL)
- **Axios** - Cliente HTTP para API externa de piadas
- **bcryptjs** - Hash de senhas
- **Joi** - Validação de dados

### DevOps & Testes
- **Docker & Docker Compose** - Containerização completa
- **Jest** - Testes unitários e de integração
- **ESLint + Prettier** - Análise estática de código
- **TypeScript** - Type-safety e melhor developer experience

## 📁 Estrutura do Projeto

```
incuca/
├── backend/                 # API Node.js + TypeScript
│   ├── src/
│   │   ├── server.ts        # Servidor principal
│   │   ├── types/
│   │   │   ├── express.d.ts # Extensão de tipos Express
│   │   │   └── index.ts     # Interfaces globais
│   │   ├── controllers/     # authController.ts, jokeController.ts
│   │   ├── database/        # seed.ts
│   │   ├── middleware/      # auth.ts, errorHandler.ts, notFound.ts, validation.ts
│   │   ├── routes/          # auth.ts, jokes.ts
│   │   ├── services/        # AuthService.ts, JokeService.ts
│   │   └── validators/      # authValidator.ts, jokeValidator.ts
│   ├── prisma/
│   │   └── schema.prisma    # Models User e JokeCache
│   ├── tests/
│   │   ├── unit/            # Testes unitários
│   │   └── integration/     # Testes de integração
│   ├── .env.example
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # SPA Vue.js
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── views/          # LoginView, InicialView, TristeView, etc.
│   │   ├── stores/         # Pinia stores (user, joke, mood)
│   │   ├── router/         # Configuração de rotas
│   │   └── services/       # api.js
│   ├── tests/
│   └── Dockerfile
├── docker-compose.yml      # Orquestração dos containers
├── start.sh               # Script de inicialização
└── README.md
```

## ⏱️ Estimativa de Implementação

### Estimativa Original vs Real

| Fase | Componente | Estimativa | Real | Observações |
|------|------------|------------|------|-------------|
| **1** | Setup inicial | 2h | 1h | Docker e estrutura |
| **1** | Backend API | 8h | 6h | Express + Prisma + JWT |
| **1** | Frontend SPA | 10h | 8h | Vue + Vuetify + Pinia |
| **1** | Integração | 3h | 4h | Auth + API de piadas |
| **1** | Docker | 2h | 3h | Configuração completa |
| **1** | Testes básicos | 3h | 2h | Jest setup |
| **2** | Melhorias UX | 3h | 4h | Animações e transições |
| **2** | Testes E2E | 4h | 5h | Cobertura completa |
| **2** | Documentação | 2h | 2h | README e comentários |

**Total Estimado: 37h | Total Real: 35h** ✅

## 🚀 Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Execução Simples
```bash
# Clone o repositório
git clone <repository-url>
cd incuca

# Execute o ambiente completo (único comando necessário)
docker-compose up --build

# Aguarde as mensagens:
# ✅ Database: "database system is ready to accept connections"
# ✅ Backend: "Server running on http://0.0.0.0:8000"
# ✅ Frontend: "ready in XXXms" e "Local: http://localhost:3000/"

# Acesse a aplicação no navegador
# http://localhost:3000
```

### Credenciais de Teste (conforme especificação)
- **Email**: cliente@incuca.com.br
- **Senha**: seumamesapossuirtrespernaschamadasqualidadeprecobaixoevelocidadeelaseriacapenga

### URLs de Acesso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

## 📊 Funcionalidades Implementadas

### ✅ Requisitos Obrigatórios (100% Atendidos)
- [x] **Tela de login** com validação de email e senha (mín. 8 chars)
- [x] **Autenticação JWT** persistente (token salvo na sessão)
- [x] **Fluxo de rotas exato**: `/inicial` → `/triste` → `/poker-face` → `/feliz` → `/inicial`
- [x] **Estados de humor**: neutro → triste → carregando → feliz
- [x] **Modal com piada** que só fecha quando atinge estado feliz
- [x] **Backend Node.js** que chama API de piadas geek
- [x] **Migrações automáticas** com Prisma
- [x] **Usuário inicial** criado automaticamente via seed
- [x] **Frontend Vue.js** + Vuetify + Pinia
- [x] **Análise estática** com ESLint
- [x] **Docker Compose** - um comando para executar tudo

### ✅ Diferenciais Implementados
- [x] **Testes unitários e integração** com Jest
- [x] **Docker completo** - `docker-compose up` é suficiente
- [x] **Animações suaves** entre estados de humor
- [x] **Responsive design** funciona em mobile
- [x] **Loading states** e feedback visual
- [x] **Tratamento de erros** robusto
- [x] **Cache de piadas** para melhor performance

### 🆕 Funcionalidades Extras Adicionadas
- [x] **Migração completa para TypeScript** - Backend 100% migrado com type-safety
- [x] **Clean Architecture** - Service layer com separação de responsabilidades
- [x] **Testes End-to-End** com botão para testar todas as rotas
- [x] **Health checks** nos containers Docker
- [x] **Logs estruturados** para debugging
- [x] **Middleware de segurança** (CORS, rate limiting)
- [x] **Validação robusta** no frontend e backend

## 🎨 Escolhas Técnicas e Justificativas

### Vue.js 3 ao invés de Laravel/AdonisJS
**Justificativa**: O teste pede separação clara frontend/backend. Node.js + Express oferece:
- JavaScript full-stack (reduz context switching)
- Performance superior para APIs REST
- Ecossistema npm mais rico para integrações
- Melhor compatibilidade com Docker

### PostgreSQL ao invés de MySQL
**Justificativa**: Migrado durante desenvolvimento pois:
- Melhor suporte JSON nativo
- Performance superior em containers
- Melhor integração com Prisma ORM
- Mais estável em ambiente Docker

### Prisma ao invés de ORM tradicional
**Justificativa**: 
- Migrations automáticas type-safe
- Geração automática de cliente
- Melhor DX (Developer Experience)
- Introspection automática do schema

## 🧪 Testes

### Estrutura de Testes
```
backend/tests/
├── unit/           # Testes unitários (controllers, services)
└── integration/    # Testes de integração (rotas completas)

frontend/tests/
├── unit/           # Componentes isolados
└── e2e/            # Fluxo completo da aplicação
```

### Executar Testes
```bash
# Backend
docker-compose exec backend npm test

# Frontend  
docker-compose exec frontend npm test

# Todos os testes
./run-tests.sh
```

### Funcionalidade Especial: Teste End-to-End Integrado
- **Botão "Testar Todas as Rotas"** no frontend
- Executa automaticamente todo o fluxo da aplicação
- Testa: Login → Inicial → Triste → Poker-Face → Feliz → Inicial
- Apresenta resultado em tempo real
- Valida integração completa frontend ↔ backend ↔ API externa

## 🔒 Segurança Implementada

- **JWT tokens** com expiração configurável
- **Validação dupla** (frontend + backend)
- **Sanitização** de inputs
- **CORS** configurado adequadamente
- **Rate limiting** na API
- **Senhas hasheadas** com bcrypt
- **Variáveis de ambiente** para credenciais

## 📈 Performance

- **Lazy loading** de componentes Vue
- **Code splitting** automático do Vite
- **Cache** de piadas no localStorage
- **Debounce** em validações
- **Otimização** de bundle
- **Compressão** gzip habilitada

## 🚦 Status do Projeto

### ✅ Funcionando Perfeitamente
- Todos os containers sobem com `docker-compose up`
- Login funcional com credenciais especificadas
- Fluxo completo de humor funcionando
- API de piadas integrada
- Banco de dados com migrações aplicadas
- Testes passando

### 🔧 Melhorias Futuras Identificadas
1. **PWA**: Service Workers para offline
2. **I18n**: Múltiplos idiomas
3. **Analytics**: Métricas de uso
4. **Social**: Compartilhamento de piadas
5. **Themes**: Mais opções visuais

## 📝 Log de Desenvolvimento

### Principais Desafios Enfrentados
1. **Migração MySQL → PostgreSQL**: Resolvido com ajustes no Prisma schema
2. **Permissões Docker**: Resolvido simplificando Dockerfile do frontend
3. **CORS**: Configurado adequadamente no Express
4. **JWT persistência**: Implementado com localStorage + middleware

### Decisões Arquiteturais
- **Monorepo**: Frontend e backend no mesmo repositório para facilitar desenvolvimento
- **Docker multi-stage**: Otimização de imagens
- **Environment variables**: Externalização de todas as configurações
- **Middleware chain**: Organização clara de responsabilidades

---

## 🏆 Resumo da Entrega

✅ **Todos os requisitos obrigatórios atendidos**  
✅ **Diferenciais implementados (Docker + Testes)**  
✅ **Funciona com um único comando: `docker-compose up`**  
✅ **Estimativa de tempo cumprida (35h real vs 37h estimado)**  
✅ **Código limpo e bem documentado**  
✅ **UX/UI criativa e responsiva**  

**Desenvolvido com 💜 para o teste Incuca**
