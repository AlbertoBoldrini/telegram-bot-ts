import * as API from './api';

class TelegramBotBoh
{

}

export interface Chat
{
    onMessage? (message: API.Message): Promise<any>;

    onEditedMessage? (message: API.Message): Promise<any>;

    onChannelPost? (message: API.Message): Promise<any>;
    
    onEditedChannelPost? (message: API.Message): Promise<any>;

    onCallbackQuery? (message: API.CallbackQuery): Promise<any>;

    onShippingQuery? (message: API.ShippingQuery): Promise<any>;

    onPreCheckoutQuery? (message: API.PreCheckoutQuery): Promise<any>;
}