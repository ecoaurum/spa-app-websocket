# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Рабочая директория в контейнере
WORKDIR /app

# Открываем порт для сервера
EXPOSE 5000

# RUN apk add --no-cache bash

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы сервера
COPY . .

# Запускаем приложение
CMD [ "npm", "start" ]


