// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
// 	plugins: [react()],
// 	host: "0.0.0.0",
// 	port: 5173,
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0", // Разрешаем доступ извне
		port: 5173, // Порт для разработки
	},
	preview: {
		port: 80, // Порт для продакшн-сервера
		host: "0.0.0.0", // Открываем для внешних запросов
	},
	define: {
		"process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
	},
});
