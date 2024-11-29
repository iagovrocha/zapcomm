# Zapcomm - Squad 18

Respositório do projeto do Squad 18 feito para a empresa [Baasic](https://baasic.com.br), na aula de Residência de Software I.

## Diretos 

Todos os direitos reservados a https://baasic.com.br

## Requistos para rodar a aplicação

As instruções abaixo permitirão que se uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

### Pré-requisitos
Será necessário a instalação dos seguintes componentes para execulção 
```
Node v14+
Docker 
Docker Compose 
```

Dowload do Docker Desktop:
```
https://www.docker.com/products/docker-desktop/ 
```
Dowload do Node:
```
https://nodejs.org/pt/download/package-manager
```
### Instalação
Um passo-a-passo para executar a aplicação para ter um ambiente de desenvolvimento em execução.

#### No Backend
Entrar na pasta do **Backend**:
```
cd backend
```
Instalar as depedências da pasta e transcrever o TypeScritp para JavaScript no **backend**:
```
npm install
npm run build
```

#### Voltar para o diretorio zapcomm
```
cd ..
```

#### No Frontend
Entrar na pasta do **Frontend**:
```
cd frontend
```
Instalar as depedências da pasta **frontend**:
```
npm install
```

#### Após finalizar as instalações:
Voltar para  o diretorio zapcomm
```
cd ..
```

## Antes de prosseguir certifique-se que no arquivo docker-compose.yml comandos abaixo estejam na linha 42 
```
command: > 
    sh -c " 
    npm run db:migrate &&
    npm run db:seed &&
    npm run dev:server"
```

Construa as imagens do docker e rode o projeto usando o comando:

# Fazendo o building do Docker
```
docker-compose up --build
```

Após esses comando, a imagem do Postgres já terá seus volumes formados e não precisa mais de migrações, remova as linhas 42 a 46 do arquivo docker-compose.yml, e deixe assim:

```
command: >
    sh -c "
    npm run dev:server
    "
```

Agora seu container está formado e quando for abrir a aplicação novamente basta usar o comando:

```
docker-compose up 
```
