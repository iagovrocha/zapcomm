FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copie o arquivo package.json e package-lock.json para instalar dependências
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie todo o código fonte para o diretório de trabalho
COPY . .

EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]