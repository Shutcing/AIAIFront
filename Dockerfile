FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY vite.config.js .

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]