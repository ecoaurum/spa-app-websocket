import React from "react";
import styles from "./styles.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const pageNumbers = [];

	for (let i = 1; i <= totalPages; i++) {
		pageNumbers.push(i);
	}

	return (
		<nav className={styles.pagination}>
			<ul>
				<li>
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={styles.navButton}
					>
						Предыдущая
					</button>
				</li>
				{pageNumbers.map((number) => (
					<li key={number}>
						<button
							onClick={() => onPageChange(number)}
							className={`${styles.pageButton} ${
								currentPage === number ? styles.active : ""
							}`}
						>
							{number}
						</button>
					</li>
				))}
				<li>
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={styles.navButton}
					>
						Следующая
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
