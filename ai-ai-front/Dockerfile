# Используем Node.js для сборки
FROM node:18 AS build

# Создаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной проект
COPY . .

# Собираем приложение
RUN npm run build

# Используем минимальный Nginx для запуска
FROM nginx:alpine

# Копируем собранное приложение из предыдущего этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
