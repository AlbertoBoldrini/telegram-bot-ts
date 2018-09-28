
import * as TelegramBot from '../index'

// replace the value below with the Telegram token you receive from @BotFather
const token = '632870589:AAG10rKY8KO0iFlSYHMjPfttFA2ZHAeJevE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot.Manager (token);

// Listen for any kind of message. There are different kinds of
// messages.
bot.on ('message', msg => 
{
    // Send a message to the chat acknowledging receipt of their message
    bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Received your message' });
});