# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Рабочая директория в контейнере
WORKDIR /app

# Открываем порт для сервера 8080
EXPOSE 8080

# Открываем порт для сервера
# EXPOSE 5000

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы сервера
COPY . .

# Запускаем приложение в режиме разработки
CMD [ "npm", "start" ]


