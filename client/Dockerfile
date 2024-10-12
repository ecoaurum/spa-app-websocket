# Используем официальный Node.js образ версии 20.17.0
FROM node:20.17.0-alpine

# Рабочая директория
WORKDIR /app

# Открываем порт для клиента
EXPOSE 5173

RUN apk add --no-cache bash

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Собираем приложение для продакшн
RUN npm run build

# Запускаем сервер (если  работать локально)
CMD ["npm", "run", "dev"]