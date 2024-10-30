import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ authToken, children }) => {
	if (!authToken) {
		// Если токена нет, перенаправляем на страницу логина
		return <Navigate to='/login' />;
	}

	// Если токен есть, рендерим защищенный компонент
	return children;
};

export default ProtectedRoute;
