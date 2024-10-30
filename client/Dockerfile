# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Собираем приложение для продакшн
RUN npm run build

# Открываем стандартный HTTP порт 80
EXPOSE 80

# Запускаем приложение 
CMD ["npm", "run", "preview"]