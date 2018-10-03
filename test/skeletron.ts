
// The import for typescirpt 
import * as TelegramBot from '../index'

// replace the value below with the Telegram token you receive from @BotFather
const token = '632870589:AAG10rKY8KO0iFlSYHMjPfttFA2ZHAeJevE';

// Create an object that manages the Telegram bot and receives the updates.
const bot = new TelegramBot.Emitter (token);

// Add a callback for every possible update

bot.on  ('error', message =>
{
    // Error with the comunication with the server during the 
    // a request of udates.
});

bot.on  ('message', message =>
{
    // New incoming message of any kind — text, photo, sticker, etc.
});

bot.on  ('edited_message', message =>
{
    // New version of a message that is known to the bot and was edited
});

bot.on  ('channel_post', message =>
{
    // New incoming channel post of any kind — text, photo, sticker, etc.
});

bot.on  ('edited_channel_post', message =>
{
    // New version of a channel post that is known to the bot and was edited
});

bot.on  ('inline_query', inlineQuery =>
{
    // New incoming inline query
});

bot.on  ('chosen_inline_result', chosenInlineResult =>
{
    // The result of an inline query that was chosen by a user and sent to 
    // their chat partner. Please see our documentation on the feedback 
    // collecting for details on how to enable these updates for your bot.
});

bot.on  ('callback_query', callbackQuery =>
{  
    // New incoming callback query
});

bot.on  ('shipping_query', shippingQuery =>
{
    // New incoming shipping query. Only for invoices with flexible price
});

bot.on  ('pre_checkout_query', preCheckoutQuery =>
{
    // New incoming pre-checkout query. Contains full information about checkout.
});

