FROM node:lts-alpine

# 1. Instala bash e dependências do Python
RUN apk add --no-cache bash python3 py3-pip build-base python3-dev

# 2. Instala o Semgrep via pip
# O --break-system-packages é necessário nas versões novas do Alpine/Python 
# para instalar globalmente sem venv.
RUN pip3 install semgrep --break-system-packages

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN chmod +x check-all.sh

EXPOSE 3000

CMD ["npm", "run", "dev"]