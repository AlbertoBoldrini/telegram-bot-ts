
import * as TelegramBot from '../index'

// replace the value below with the Telegram token you receive from @BotFather
const token = '632027533:AAHCN08-T7N_Ku1tXKEl9ct7KC2Pa22ybag';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot.Emitter (token);

let reply_keyboard = { inline_keyboard: 
[
    [ { text: "Ciao", callback_data: "Hollaa" }, { text: "Cacca", callback_data: "Merda" } ]
]};


// Listen for any kind of message. There are different kinds of
// messages.
bot.on ('message', async msg => 
{
    try
    {
        // Send a message to the chat acknowledging receipt of their message
        let result = await bot.api.sendMessage ({ chat_id: msg.chat.id, text: 'Received your message', reply_markup: JSON.stringify(reply_keyboard) });

        console.log (result);
    }

    catch (error)
    {
        console.error (error);
    }
});

bot.on ('callback_query', query =>
{
    console.log (query);
});