#!/bin/bash

# 🚀 Script de Inicialização do Projeto Incuca
# Este script configura e inicia o ambiente completo de desenvolvimento

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
WARNING="⚠️"
ERROR="❌"
INFO="ℹ️"
PACKAGE="📦"
DATABASE="🗄️"
WEB="🌐"

echo -e "${PURPLE}${ROCKET} Iniciando Projeto Incuca Geek Jokes...${NC}"
echo -e "${CYAN}================================================${NC}"

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para aguardar serviço
wait_for_service() {
    local url=$1
    local name=$2
    local max_tries=30
    local try=0
    
    echo -e "${YELLOW}${INFO} Aguardando ${name}...${NC}"
    
    while [ $try -lt $max_tries ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}${CHECK} ${name} está rodando!${NC}"
            return 0
        fi
        try=$((try + 1))
        sleep 2
        echo -n "."
    done
    
    echo -e "\n${RED}${ERROR} Timeout aguardando ${name}${NC}"
    return 1
}

# Verificar dependências
echo -e "\n${BLUE}${PACKAGE} Verificando dependências...${NC}"

if ! command_exists docker; then
    echo -e "${RED}${ERROR} Docker não está instalado!${NC}"
    echo -e "${YELLOW}Instale o Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}${ERROR} Docker Compose não está instalado!${NC}"
    echo -e "${YELLOW}Instale o Docker Compose: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${YELLOW}${WARNING} Node.js não encontrado. Usando versão do container...${NC}"
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}${CHECK} Node.js ${NODE_VERSION} encontrado${NC}"
fi

if ! command_exists npm; then
    echo -e "${YELLOW}${WARNING} NPM não encontrado. Usando versão do container...${NC}"
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}${CHECK} NPM ${NPM_VERSION} encontrado${NC}"
fi

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}${ERROR} docker-compose.yml não encontrado!${NC}"
    echo -e "${YELLOW}Execute este script a partir do diretório raiz do projeto${NC}"
    exit 1
fi


echo -e "\n${BLUE}🧹 Limpando ambiente anterior...${NC}"
docker-compose down -v 2>/dev/null || true

# Construir e iniciar containers
echo -e "\n${BLUE}🏗️ Construindo containers...${NC}"
docker-compose build
echo -e "\n${BLUE}🚀 Iniciando containers...${NC}"
docker-compose up -d

# Aguardar serviços
echo -e "\n${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"

    # Aguardar Backend

# Aguardar Backend
wait_for_service "http://localhost:8000/health" "Backend API"

# Aguardar Frontend
wait_for_service "http://localhost:3000" "Frontend"

# Executar migrações do banco
echo -e "\n${BLUE}${DATABASE} Executando migrações do banco...${NC}"
docker-compose exec backend npx prisma migrate deploy

# Executar seed se necessário
echo -e "\n${BLUE}🌱 Executando seed do banco...${NC}"
docker-compose exec backend npm run db:seed

# Verificar se tudo está funcionando
echo -e "\n${BLUE}🔍 Verificando saúde dos serviços...${NC}"

# Testar backend
BACKEND_HEALTH=$(curl -s http://localhost:8000/health | grep -o '"success":true' || echo "error")
if [ "$BACKEND_HEALTH" = '"success":true' ]; then
    echo -e "${GREEN}${CHECK} Backend API está saudável${NC}"
else
    echo -e "${RED}${ERROR} Backend API com problemas${NC}"
fi

# Testar frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}${CHECK} Frontend está saudável${NC}"
else
    echo -e "${RED}${ERROR} Frontend com problemas (Status: ${FRONTEND_STATUS})${NC}"
fi

    # Informações finais
    echo -e "\n${GREEN}${ROCKET} PROJETO INICIADO COM SUCESSO! ${ROCKET}${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "\n${YELLOW}🌐 URLs dos Serviços:${NC}"
    echo -e "   Frontend:    http://localhost:3000"
    echo -e "   Backend API: http://localhost:8000/api"

echo -e "\n${YELLOW}🔑 Credenciais de Teste:${NC}"
echo -e "   Email:    cliente@incuca.com.br"
echo -e "   Senha:    seumamesapossuirtrespernaschamadasqualidadeprecobaixoevelocidadeelaseriacapenga"

echo -e "\n${YELLOW}🗄️ Banco de Dados:${NC}"
echo -e "   Host:     localhost"
echo -e "   Porta:    5432"
echo -e "   Database: incuca"
echo -e "   User:     incuca"
echo -e "   Password: secret"

echo -e "\n${YELLOW}📚 Recursos Úteis:${NC}"
echo -e "   Documentação API: docs/API.md"
echo -e "   README:           README.md"
echo -e "   Logs Backend:     docker-compose logs backend"
echo -e "   Logs Frontend:    docker-compose logs frontend"

echo -e "\n${YELLOW}🛠️ Comandos Úteis:${NC}"
echo -e "   Parar projeto:    docker-compose down"
echo -e "   Ver logs:         docker-compose logs -f"
echo -e "   Restart serviço:  docker-compose restart [serviço]"
echo -e "   Limpar volumes:   docker-compose down -v"

echo -e "\n${GREEN}✨ O projeto está pronto para uso! Acesse http://localhost:3000${NC}"
echo -e "${CYAN}================================================${NC}"

# Abrir browser automaticamente (opcional)
if command_exists xdg-open; then
    echo -e "\n${BLUE}🌐 Abrindo aplicação no navegador...${NC}"
    sleep 3
    xdg-open http://localhost:3000 &>/dev/null &
elif command_exists open; then
    echo -e "\n${BLUE}🌐 Abrindo aplicação no navegador...${NC}"
    sleep 3
    open http://localhost:3000 &>/dev/null &
fi

# Monitorar logs em background (opcional)
echo -e "\n${BLUE}📊 Para acompanhar os logs em tempo real, execute:${NC}"
echo -e "   ${YELLOW}docker-compose logs -f${NC}"
