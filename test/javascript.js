

import * as TelegramBot from 'telegram-bot-js'

// replace the value below with the Telegram token you receive from @BotFather
const token = '632027533:AAHCN08-T7N_Ku1tXKEl9ct7KC2Pa22ybag';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot.Emitter (token);

bot.on ('message', message =>
{

});