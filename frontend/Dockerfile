FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Configurar permissões para desenvolvimento
RUN chmod -R 777 /app

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
