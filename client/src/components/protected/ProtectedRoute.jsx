import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ authToken, children }) => {
	// Проверка наличия токена в localStorage, если authToken отсутствует в props
	const isAuthenticated = authToken || localStorage.getItem("token");

	if (!isAuthenticated) {
		// Если пользователь не авторизован, перенаправляем на страницу входа
		return <Navigate to='/login' replace />;
	}
	return children;
};

export default ProtectedRoute;
