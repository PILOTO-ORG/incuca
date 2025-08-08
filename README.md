# Teste Fullstack - Incuca
## SPA das Piadas Geek 🤖😄

Uma aplicação Single Page Application que brinca com o humor usando piadas geek da API pública.

## 📋 Descrição do Projeto

A aplicação implementa um fluxo de humor onde o usuário navega por diferentes estados emocionais:
- **Login**: Autenticação com JWT
- **Inicial** (`/inicial`): Estado neutro 😐
- **Triste** (`/triste`): Estado triste 😢
- **Poker Face** (`/poker-face`): Carregando piada 😑
- **Feliz** (`/feliz`): Estado feliz após a piada 😄

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Vue.js 3** - Framework reativo
- **Vuetify 3** - Biblioteca de componentes Material Design
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento
- **Axios** - Cliente HTTP
- **ESLint + Prettier** - Análise estática de código

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT (jsonwebtoken)** - Autenticação
- **Prisma** - ORM para banco de dados
- **MySQL** - Banco de dados
- **Axios** - Cliente HTTP para API externa

### DevOps & Testes
- **Docker & Docker Compose** - Containerização
- **Jest + Vue Test Utils** - Testes frontend
- **Jest + Supertest** - Testes backend

## 📁 Estrutura do Projeto

```
incuca/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── prisma/
│   └── tests/
├── frontend/               # SPA Vue.js
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   └── router/
│   └── tests/
├── docker-compose.yml      # Orquestração dos containers
└── README.md
```

## ⏱️ Estimativa de Implementação

### Fase 1: Requisitos Obrigatórios (24-28 horas)

| Componente | Tarefa | Tempo Estimado |
|------------|--------|----------------|
| **Setup** | Configuração inicial do projeto | 2h |
| **Backend** | API Node.js + Express + Prisma | 8h |
| **Frontend** | Vue.js + Vuetify + Componentes | 10h |
| **Integração** | Conexão Frontend ↔ Backend | 3h |
| **Docker** | Containerização completa | 2h |
| **Testes** | Testes unitários e integração | 3h |

### Fase 2: Melhorias e Diferenciais (8-12 horas)

| Componente | Tarefa | Tempo Estimado |
|------------|--------|----------------|
| **UX/UI** | Animações e transições | 3h |
| **Testes** | Cobertura completa de testes | 4h |
| **DevOps** | CI/CD e otimizações | 2h |
| **Documentação** | Documentação técnica detalhada | 2h |

**Total Estimado: 32-40 horas**

## 🚀 Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Execução
```bash
# Clone o repositório
git clone <repository-url>
cd incuca

# Execute o ambiente completo
docker-compose up

# Acesse a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Credenciais de Teste
- **Email**: cliente@incuca.com.br
- **Senha**: seumamesapossuirtrespernaschamadasqualidadeprecobaixoevelocidadeelaseriacapenga

## 🔧 Scripts Disponíveis

### Frontend
```bash
cd frontend
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run test         # Testes
npm run lint         # Análise estática
```

### Backend
```bash
cd backend
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm test             # Testes
npm run lint         # Análise estática
npm run db:migrate   # Executar migrações
```

## 📊 Funcionalidades Implementadas

### ✅ Requisitos Obrigatórios
- [x] Login com validação (email + senha mín. 8 chars)
- [x] Autenticação JWT persistente
- [x] Rotas: `/inicial`, `/triste`, `/poker-face`, `/feliz`
- [x] Estados de humor progressivos
- [x] Modal com piadas da API geek
- [x] Backend Node.js com migrações Prisma
- [x] Frontend Vue.js + Vuetify + Pinia
- [x] Análise estática (ESLint)
- [x] Docker Compose

### ✅ Diferenciais
- [x] Testes unitários e integração
- [x] Docker para ambiente completo
- [x] Animações e transições suaves
- [x] Responsive design
- [x] Loading states e feedback visual

## 🎨 Escolhas Técnicas

### Frontend - Vue.js 3 + Composition API
**Justificativa**: Vue.js oferece uma curva de aprendizado suave, excelente reatividade e um ecossistema maduro. A Composition API permite melhor organização do código e tipagem.

### UI Library - Vuetify 3
**Justificativa**: Material Design já testado, componentes ricos, tema dark/light automático e excelente acessibilidade.

### Estado - Pinia
**Justificativa**: Store oficial do Vue.js, mais leve que Vuex, melhor TypeScript support e DevTools integrado.

### Backend - Node.js + Express
**Justificativa**: Node.js oferece excelente performance para APIs REST, JavaScript full-stack facilita desenvolvimento, ecossistema npm rico e Express.js é amplamente testado.

### ORM - Prisma
**Justificativa**: Type-safe, migrations automáticas, excelente DX, suporte completo ao MySQL e geração automática de cliente.

### Banco - MySQL
**Justificativa**: Amplamente suportado, performance comprovada e integração perfeita com Prisma.

## 🧪 Testes

### Cobertura de Testes
- **Frontend**: Componentes, stores, router, utilities
- **Backend**: Controllers, Models, Services, Middleware
- **Integração**: Fluxo completo de autenticação e piadas

### Executar Testes
```bash
# Frontend
cd frontend && npm test

# Backend  
cd backend && npm test

# Com coverage
npm run test:coverage
```

## 🔒 Segurança

- JWT tokens com refresh automático
- Validação de inputs no frontend e backend
- Sanitização de dados
- CORS configurado adequadamente
- Rate limiting na API

## 📈 Performance

- Lazy loading de componentes
- Code splitting automático
- Cache de piadas no frontend
- Otimização de bundle
- Imagens otimizadas

## 🎯 Próximos Passos

1. **Métricas**: Implementar analytics de uso
2. **PWA**: Transformar em Progressive Web App
3. **I18n**: Suporte a múltiplos idiomas
4. **Themes**: Mais opções de temas
5. **Social**: Compartilhamento de piadas

## 📝 Licença

MIT License - veja LICENSE.md para detalhes.

---

**Desenvolvido com 💜 para o teste Incuca**
