import telebot
import uuid

# Замените на свой токен бота, полученный от BotFather
BOT_TOKEN = "7723573817:AAHELwscobE3LOI1Sdfgvp9_xWqtPlJYn_4"

bot = telebot.TeleBot(BOT_TOKEN)

# Словарь для хранения соответствия unique_id и user_id (вместо базы данных для простоты)
link_data = {}


@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "Привет! Используйте /generate_link чтобы создать ссылку.")


@bot.message_handler(commands=['generate_link'])
def generate_link(message):
    user_id = message.from_user.id
    unique_id = str(uuid.uuid4())  # Генерируем уникальный ID
    link_data[unique_id] = user_id  # Сохраняем соответствие

    link = f"t.me/{bot.get_me().username}?start={unique_id}"
    bot.reply_to(message, f"Ваша ссылка: {link}")


@bot.message_handler(func=lambda message: message.text and message.text.startswith('/start'))
def handle_start_with_id(message):
    try:
        unique_id = message.text.split()[1]  # Извлекаем unique_id из текста команды /start
        if unique_id in link_data:
            creator_id = link_data[unique_id]
            # TODO: Отправить Пользователю 2 запрос на контакт Пользователя 1
            bot.reply_to(message, "Вы перешли по ссылке! Теперь нужно поделиться контактом создателя ссылки.")
        else:
            bot.reply_to(message, "Неверная ссылка.")
    except IndexError:
        bot.reply_to(message, "Неверная ссылка.")


# TODO: Обработчик для получения контакта

bot.infinity_polling()
