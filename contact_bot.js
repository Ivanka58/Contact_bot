const TelegramBot = require('node-telegram-bot-api');

// Замените 'YOUR_BOT_TOKEN' на токен вашего бота
const token = '7964336070:AAFyXbc-UGYvKwM2B2wYlY0grBynfWBlsJE';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Объект для хранения планов (ключ - ID чата, значение - массив планов)
const plans = {};

// Функция для добавления плана
function addPlan(chatId, time, task) {
    if (!plans[chatId]) {
        plans[chatId] = [];
    }
    plans[chatId].push({ time: time, task: task });
}

// Функция для удаления плана
function deletePlan(chatId, index) {
    if (plans[chatId] && plans[chatId][index]) {
        plans[chatId].splice(index, 1);
        return true;
    }
    return false;
}

// Функция для отправки напоминания
function sendReminder(chatId, time, task) {
    bot.sendMessage(chatId, `Напоминание! В ${time} - ${task}`);
}

// Функция для проверки и отправки напоминаний
function checkReminders() {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    for (const chatId in plans) {
        if (plans.hasOwnProperty(chatId)) {
            plans[chatId].forEach((plan) => {
                if (plan.time === currentTime) {
                    sendReminder(chatId, plan.time, plan.task);
                }
            });
        }
    }
}

// Запускаем проверку напоминаний каждую минуту
setInterval(checkReminders, 60 * 1000); // 60000 миллисекунд = 1 минута

// Обработчик команды /addplan
bot.onText(/\/addplan (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1]; // Текст после /addplan

    // Разбираем текст на время и задачу
    const parts = text.split(' ');
    const time = parts[0];
    const task = parts.slice(1).join(' ');

    // Проверяем, что время указано в правильном формате (например, "10:00")
    if (!/^\d{2}:\d{2}$/.test(time)) {
        bot.sendMessage(chatId, 'Неверный формат времени. Используйте формат ЧЧ:ММ (например, 10:00).');
        return;
    }

    if (!task) {
        bot.sendMessage(chatId, 'Пожалуйста, укажите задачу.');
        return;
    }

    addPlan(chatId, time, task);
    bot.sendMessage(chatId, `План добавлен: ${time} - ${task}`);
});
if (plans[chatId] && plans[chatId].length > 0) {
        let message = 'Ваши планы:\n';
        plans[chatId].forEach((plan, index) => {
            message += `${index + 1}. ${plan.time} - ${plan.task}\n`;
        });
        bot.sendMessage(chatId, message);
    } else {
        bot.sendMessage(chatId, 'У вас пока нет планов.');
    }
});

// Обработчик команды /deleteplan
bot.onText(/\/deleteplan (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const index = parseInt(match[1]) - 1; // Индекс плана (начинается с 1)

    if (isNaN(index) || index < 0) {
        bot.sendMessage(chatId, 'Неверный номер плана.');
        return;
    }

    if (deletePlan(chatId, index)) {
        bot.sendMessage(chatId, 'План удален.');
    } else {
        bot.sendMessage(chatId, 'План с таким номером не найден.');
    }
});

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `Привет! Я бот-напоминалка.\n\n` +
                     `**Список команд:**\n` +
                     `/start - Начать работу с ботом\n` +
                     `/addplan <время> <задача> - Добавить новый план (например, /addplan 10:00 Встреча с клиентом)\n` +
                     `/listplans - Показать список всех планов\n` +
                     `/deleteplan <номер> - Удалить план по номеру из списка (например, /deleteplan 1)\n`;
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' }); // Используем Markdown для форматирования
});

// Обработчик команды /help (если хотите отдельную команду помощи)
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `**Список команд:**\n` +
                     `/start - Начать работу с ботом\n` +
                     `/addplan <время> <задача> - Добавить новый план (например, /addplan 10:00 Встреча с клиентом)\n` +
                     `/listplans - Показать список всех планов\n` +
                     `/deleteplan <номер> - Удалить план по номеру из списка (например, /deleteplan 1)\n`;
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

console.log('Бот запущен...');
// Обработчик команды /listplans
bot.onText(/\/listplans/, (msg) => {
    const chatId = msg.chat.id;
