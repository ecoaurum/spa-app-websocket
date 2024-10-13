# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Объявляем переменные для клиента
ARG CLIENT_URL
ARG VITE_API_URL

# Рабочая директория
WORKDIR /app


# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Устанавливаем переменные среды для клиента
ENV VITE_API_URL=$VITE_API_URL
ENV CLIENT_URL=$CLIENT_URL

# Собираем приложение для продакшн
RUN npm run build

# Открываем стандартный HTTP порт
# EXPOSE 80

# Запускаем сервер 
CMD ["npm", "run", "preview"]