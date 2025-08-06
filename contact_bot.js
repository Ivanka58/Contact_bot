const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

// Замените на свой токен бота, полученный от BotFather
const BOT_TOKEN = "7723573817:AAHELwscobE3LOI1Sdfgvp9_xWqtPlJYn_4";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Словарь для хранения соответствия user_id и кодового слова
const keywordData = {};

// Словарь для хранения userID создателя и перешедшего (после ввода кодового слова).
const contactRequests = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Привет! Используйте /set_keyword, чтобы задать кодовое слово, и /enter_keyword, чтобы ввести кодовое слово.");
});

// Обработчик команды /set_keyword
bot.onText(/\/set_keyword/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  bot.sendMessage(chatId, "Пожалуйста, введите кодовое слово:");

  // Ожидаем следующее сообщение от пользователя
  bot.once('message', (msg) => {
    const keyword = msg.text;
    keywordData[userId] = keyword; // Сохраняем кодовое слово
    bot.sendMessage(chatId, "Кодовое слово сохранено!");
  });
});

// Обработчик команды /enter_keyword
bot.onText(/\/enter_keyword/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  bot.sendMessage(chatId, "Пожалуйста, введите кодовое слово:");

  // Ожидаем следующее сообщение от пользователя
  bot.once('message', (msg) => {
    const enteredKeyword = msg.text;
    let creatorId = null;

    // Ищем создателя по кодовому слову
    for (const id in keywordData) {
      if (keywordData[id] === enteredKeyword) {
        creatorId = id;
        break;
      }
    }

    if (creatorId) {
      contactRequests[userId] = creatorId; // Сохраняем creatorId для последующей передачи контакта

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

      bot.sendMessage(chatId, "Кодовое слово найдено! Пожалуйста, поделитесь своим контактом.", keyboard);
    } else {
      bot.sendMessage(chatId, "Кодовое слово не найдено( ");
    }
  });
});

// Обработчик получения контакта
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const contact = msg.contact;

  if (contactRequests[userId]) {
    const creatorId = contactRequests[userId];
    const contactName = msg.contact.first_name + (msg.contact.last_name ? ' ' + msg.contact.last_name : '');

    // Отправляем пользователю 1 имя контакта
    bot.sendMessage(creatorId, `Пользователь, знающий кодовое слово, поделился контактом. Имя контакта: ${contactName}`);

    delete contactRequests[userId]; // Удаляем запрос, чтобы не отправлять имя повторно
    bot.sendMessage(chatId, "Спасибо за участие в тестировании моего бота!");
  } else {
    bot.sendMessage(chatId, "Произошла ошибка. Пожалуйста, введите кодовое слово еще раз.");
  }
});

console.log('Бот запущен...');
