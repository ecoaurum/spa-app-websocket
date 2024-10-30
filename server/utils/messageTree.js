// Функция для построения дерева сообщений (с учётом родительских сообщений и ответов)
function buildMessageTree(messages) {
	// console.log("Messages before building tree:", messages);
	const messageMap = new Map(); // Карта для хранения сообщений по ID
	const roots = []; // Массив для корневых сообщений (тех, у которых нет родителя)

	// Первый проход: создание карты сообщений
	messages.forEach((msg) => {
		msg.replies = []; // Добавляем свойство replies (массив) для хранения ответов
		messageMap.set(msg.id, msg); // Сохраняем сообщение в мапе по его id
	});

	// Второй проход: построение дерева сообщений
	messages.forEach((msg) => {
		if (msg.parentid) {
			// Если у сообщения есть родитель
			const parent = messageMap.get(msg.parentid); // Получаем родительское сообщение - находим по id
			if (parent) {
				parent.replies.push(msg); // Добавляем сообщение как ответ на родительское
			} else {
				// roots.push(msg); // Если родитель не найден, добавляем сообщение как корневое
				console.warn(
					`Не найден родитель с id ${msg.parentid} для сообщения`,
					msg
				);
			}
		} else {
			roots.push(msg); // Если у сообщения нет родителя, добавляем его как корневое
		}
	});

	// console.log("Сформированное дерево сообщений:", roots);
	return roots; // Возвращаем корневые сообщения с вложенными ответами
}

module.exports = { buildMessageTree }; // Экспорт функции
