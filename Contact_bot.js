const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

// Замените на свой токен бота, полученный от BotFather
const BOT_TOKEN = "7723573817:AAHELwscobE3LOI1Sdfgvp9_xWqtPlJYn_4";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Словарь для хранения соответствия unique_id и user_id (вместо базы данных для простоты)
const linkData = {};

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;

  if (match[0] === '/start') { // Обработка команды /start без параметров
    bot.sendMessage(chatId, "Привет! Используйте /generate_link чтобы создать ссылку.");
  } else { // Обработка команды /start с параметром (unique_id)
    const uniqueId = msg.text.split(' ')[1]; // Извлекаем unique_id
    if (uniqueId && linkData[uniqueId]) {
      const creatorId = linkData[uniqueId];
      // TODO: Отправить Пользователю 2 запрос на контакт Пользователя 1
      bot.sendMessage(chatId, "Вы перешли по ссылке! Теперь нужно поделиться контактом создателя ссылки.");
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

// TODO: Обработчик для получения контакта

console.log('Бот запущен...');
