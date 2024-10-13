# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Объявляем переменные, которые Railway предоставит на этапе сборки
ARG MYSQL_URL
ARG PORT

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

# Устанавливаем переменные среды на этапе сборки
ENV MYSQL_URL=$MYSQL_URL
ENV PORT=$PORT

# Открываем порт для сервера
EXPOSE $PORT

# Запускаем приложение
CMD [ "npm", "start" ]


