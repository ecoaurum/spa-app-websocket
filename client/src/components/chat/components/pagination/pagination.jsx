import React from "react";
import styles from "./styles.module.css"; // Импортируем стили

// Определяем компонент Pagination, который принимает три пропса:
// текущую страницу, общее количество страниц и функцию для изменения страницы
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const pageNumbers = []; // Создаем пустой массив для номеров страниц

	// Заполняем массив номерами страниц от 1 до общего количества страниц (totalPages)
	for (let i = 1; i <= totalPages; i++) {
		pageNumbers.push(i); // Добавляем текущее значение i (номер страницы) в массив pageNumbers
	}

	// Возвращаем JSX для отображения пагинации
	return (
		<nav className={styles.pagination}>
			{/* Список навигационных кнопок */}
			<ul>
				<li>
					{/* Кнопка для перехода на предыдущую страницу */}
					<button
						onClick={() => onPageChange(currentPage - 1)} // Обработчик клика для уменьшения номера текущей страницы на 1
						disabled={currentPage === 1} // Отключаем кнопку, если текущая страница первая
						className={styles.navButton} // Применяем стили
					>
						Предыдущая
					</button>
				</li>

				{/* Отображение кнопок для перехода на каждую страницу */}
				{pageNumbers.map((number) => (
					<li key={number}>
						<button
							onClick={() => onPageChange(number)} // Вызывает функцию onPageChange с текущим номером страницы
							className={`${styles.pageButton} ${
								// Объединяем классы стилей
								currentPage === number ? styles.active : ""
							}`} // Добавляет класс active для текущей страницы
						>
							{number} {/* Отображаем номер страницы */}
						</button>
					</li>
				))}
				<li>
					{/* Кнопка для перехода на следующую страницу */}
					<button
						onClick={() => onPageChange(currentPage + 1)} // Обработчик клика для увеличения номера текущей страницы на 1
						disabled={currentPage === totalPages} // Отключаем кнопку, если текущая страница последняя
						className={styles.navButton} // Применяем стили
					>
						Следующая
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
