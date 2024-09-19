FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copie o arquivo package.json e package-lock.json
COPY package*.json ./

# Instale as dependências, incluindo TypeScript e TypeORM
RUN npm install

RUN npm install -g ts-node-dev

# Copie todo o código fonte para o diretório de trabalho
COPY . .

EXPOSE 8080
# Execute as migrações antes de iniciar o servidor
CMD ["npm", "run", "dev:server"]