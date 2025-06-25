FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY . .

COPY package*.json ./
RUN npm install --only=production

CMD ["npm", "start"]

