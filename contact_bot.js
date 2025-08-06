const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

// Замените на свой токен бота, полученный от BotFather
const BOT_TOKEN = "7723573817:AAHELwscobE3LOI1Sdfgvp9_xWqtPlJYn_4";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Словарь для хранения соответствия unique_id и user_id
const linkData = {};

// Словарь для хранения userID создателя и перешедшего.
const contactRequests = {};


bot.onText(/\/start/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (match[0] === '/start') { // Обработка команды /start без параметров
        bot.sendMessage(chatId, "Привет! Используйте /generate_link чтобы создать ссылку.");
    } else { // Обработка команды /start с параметром (unique_id)
        const uniqueId = msg.text.split(' ')[1]; // Извлекаем unique_id
        if (uniqueId && linkData[uniqueId]) {
            const creatorId = linkData[uniqueId];
            contactRequests[msg.from.id] = creatorId; // Сохраняем creatorId для последующей передачи контакта

            // Запрашиваем контакт у пользователя
            const keyboard = {
                "reply_markup": {
                    "keyboard": [[{
                        text: "Поделиться контактом",
                        request_contact: true
                    }]],
                    "one_time_keyboard": true,
                    "resize_keyboard": true
                }
            };

            bot.sendMessage(chatId, "Вы перешли по ссылке! Пожалуйста, поделитесь своим контактом. ", keyboard);
        } else {
            bot.sendMessage(chatId, "Неверная ссылка.");
        }
    }
});


bot.onText(/\/generate_link/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const uniqueId = uuidv4(); // Генерируем уникальный ID
    linkData[uniqueId] = userId; // Сохраняем соответствие

    const botUsername = (await bot.getMe()).username; // Получаем имя пользователя бота асинхронно
    const link = `t.me/${botUsername}?start=${uniqueId}`;
    bot.sendMessage(chatId, `Ваша ссылка: ${link}`);
});


// Обработчик получения контакта
bot.on('contact', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const contact = msg.contact;

    if (contactRequests[userId]) {
        const creatorId = contactRequests[userId];
        const contactName = msg.contact.first_name + (msg.contact.last_name ? ' ' + msg.contact.last_name : '');


        //Отправляем пользователю 1, имя, под которым он записан у пользователя 2
        bot.sendMessage(creatorId, `Пользователь, перешедший по вашей ссылке, поделился контактом. Имя контакта: ${contactName}`);


        delete contactRequests[userId]; // Удаляем запрос, чтобы не отправлять имя повторно
        bot.sendMessage(chatId, "Спасибо за участие в тестировании моего бота!");
    } else {
        bot.sendMessage(chatId, "Произошла ошибка. Пожалуйста, перейдите по ссылке еще раз.");
    }
});

console.log('Бот запущен...');
const port = process.env.PORT || 3000;

server.listen(port, (err) => {
    if (err) {
        console.error(`Ошибка при запуске сервера: ${err.message}`);
        logToFile(`Ошибка при запуске сервера: ${err.message}`);
        process.exit(1); // Завершаем приложение с ошибкой
    } else {
        console.log(`Сервер запущен на порту ${port}`);
        logToFile(`Сервер запущен на порту ${port}`);
    }
});
