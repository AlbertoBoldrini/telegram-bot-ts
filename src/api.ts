
import * as Https  from 'https';

/**
 * All official methods of the Telegram Bot API without abstraction.
 */
export class TelegramBotAPI
{
    /**
     * Each bot is given a unique authentication token when it is created. 
     * The token looks something like 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
     */
    private token: string;

    /**
     * To use this class a token is **required** and can be obtained
     * by talking to [@botfather](https://telegram.me/BotFather).
     */
    constructor (token: string)
    {
        // Token for the authentication
        this.token = token;
    }

    /**
     * Make an HTTPS POST multipart/form-data request to the Telegram server 
     */
    public async request (method: string, params: { [s: string]: any }): Promise<any>
    {
        return new Promise ((resolve, reject) =>
        {
            // The separator used in the multipart request
            let boundary = 'FkEDmYLIktZjh6eaHViDpH0bbx';

            // Parts the compose the body of the request
            let parts: Array<Buffer> = []

            for (let name in params)
            {
                // Print the headers of this parameter
                parts.push (Buffer.from ('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"'));
                
                // If this parameter is a buffer send it as binary data
                if (params[name].name && params[name].data)
                    parts.push (Buffer.from('; filename="'+ params[name].name +'"\r\nContent-Type: application/octet-stream\r\n\r\n'), params[name].data);

                // Else it is converted into a string
                else
                    parts.push (Buffer.from('\r\n\r\n' + params[name]));

                // Conclude the part for this parameter
                parts.push (Buffer.from('\r\n'));
            }

            if (parts.length)
            {
                // Add the final separator to conclude the request
                parts.push (Buffer.from ('--' + boundary + '--\r\n'));
            }

            // Create the body concatenating the parts
            let body: Buffer = Buffer.concat (parts);
  
            // Initialize the HTTP request using the built-in module
            let request = Https.request (
            { 
                // All methods can be made with POST requests
                method: 'POST', 

                // The path contains the authentication token
                // and the method of the Telegram API
                path: '/bot' + this.token + '/' + method, 

                // Hostname of Telegram's servers
                hostname: 'api.telegram.org',

                // Headers that specify the type and length of the body
                headers: 
                { 
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Content-Length': body.byteLength 
                },

            }, (response) =>
            {
                // The chunks that compose the HTTP response body
                let chunks: Array<Buffer> = [];

                // Set the callbacks for error in the errors and chunks
                response.on ('error', (error: Error ) => reject (error));
                response.on ('data',  (chunk: Buffer) => chunks.push (chunk));
                
                // Callback called when the response is completed.
                // Now the concatenation of chunks is the whole response body.
                response.on ('end', () =>
                {
                    try
                    {
                        // Produce a string from the chunks
                        let json = Buffer.concat (chunks).toString('utf8');

                        // Parse the string as a JSON
                        let parsed = JSON.parse (json);
                        
                        // The response contains a JSON object, which always has a Boolean field ‘ok’
                        // and may have an optional String field ‘description’ 
                        // with a human-readable description of the result. 
                        // If ‘ok’ equals true, the request was successful and the result of the query
                        // can be found in the ‘result’ field. In case of an unsuccessful request, 
                        // ‘ok’ equals false and the error is explained in the ‘description’. 
                        parsed.ok ? resolve (parsed.result) : reject (new Error (parsed.description));
                    }

                    catch (error)
                    {
                        // Catch errors in the parsing phase 
                        reject (error);
                    }
                });
            });

            // Catch errors during the request to the server
            request.on ('error', error => reject (error));

            // Write the body of the request and close the request.
            request.write (body);
            request.end ();
        });
    }

    
    /**
     * Use this method to receive incoming updates using long polling (wiki). An Array
     * of Update objects is returned.    
     */
    public async getUpdates (params: GetUpdatesParams): Promise<Array<Update>>
    {
        return this.request ('getUpdates', params);
    }

    /**
     * Use this method to specify a url and receive incoming updates via an outgoing
     * webhook. Whenever there is an update for the bot, we will send an HTTPS POST
     * request to the specified url, containing a JSON-serialized Update. In case of an
     * unsuccessful request, we will give up after a reasonable amount of attempts.
     * Returns True on success.If you'd like to make sure that the Webhook request
     * comes from Telegram, we recommend using a secret path in the URL, e.g.
     * https://www.example.com/<token>. Since nobody else knows your bot‘s token, you
     * can be pretty sure it’s us.    
     */
    public async setWebhook (params: SetWebhookParams): Promise<boolean>
    {
        return this.request ('setWebhook', params);
    }

    /**
     * Use this method to remove webhook integration if you decide to switch back to
     * getUpdates. Returns True on success. Requires no parameters.    
     */
    public async deleteWebhook (): Promise<boolean>
    {
        return this.request ('deleteWebhook', {});
    }

    /**
     * Use this method to get current webhook status. Requires no parameters. On
     * success, returns a WebhookInfo object. If the bot is using getUpdates, will
     * return an object with the url field empty.    
     */
    public async getWebhookInfo (): Promise<WebhookInfo>
    {
        return this.request ('getWebhookInfo', {});
    }

    /**
     * A simple method for testing your bot's auth token. Requires no parameters.
     * Returns basic information about the bot in form of a User object.    
     */
    public async getMe (): Promise<User>
    {
        return this.request ('getMe', {});
    }

    /**
     * Use this method to send text messages. On success, the sent Message is returned.    
     */
    public async sendMessage (params: SendMessageParams): Promise<Message>
    {
        return this.request ('sendMessage', params);
    }

    /**
     * Use this method to forward messages of any kind. On success, the sent Message is
     * returned.    
     */
    public async forwardMessage (params: ForwardMessageParams): Promise<Message>
    {
        return this.request ('forwardMessage', params);
    }

    /**
     * Use this method to send photos. On success, the sent Message is returned.    
     */
    public async sendPhoto (params: SendPhotoParams): Promise<Message>
    {
        return this.request ('sendPhoto', params);
    }

    /**
     * Use this method to send audio files, if you want Telegram clients to display
     * them in the music player. Your audio must be in the .mp3 format. On success, the
     * sent Message is returned. Bots can currently send audio files of up to 50 MB in
     * size, this limit may be changed in the future.For sending voice messages, use
     * the sendVoice method instead.    
     */
    public async sendAudio (params: SendAudioParams): Promise<Message>
    {
        return this.request ('sendAudio', params);
    }

    /**
     * Use this method to send general files. On success, the sent Message is returned.
     * Bots can currently send files of any type of up to 50 MB in size, this limit may
     * be changed in the future.    
     */
    public async sendDocument (params: SendDocumentParams): Promise<Message>
    {
        return this.request ('sendDocument', params);
    }

    /**
     * Use this method to send video files, Telegram clients support mp4 videos (other
     * formats may be sent as Document). On success, the sent Message is returned. Bots
     * can currently send video files of up to 50 MB in size, this limit may be changed
     * in the future.    
     */
    public async sendVideo (params: SendVideoParams): Promise<Message>
    {
        return this.request ('sendVideo', params);
    }

    /**
     * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without
     * sound). On success, the sent Message is returned. Bots can currently send
     * animation files of up to 50 MB in size, this limit may be changed in the future.    
     */
    public async sendAnimation (params: SendAnimationParams): Promise<Message>
    {
        return this.request ('sendAnimation', params);
    }

    /**
     * Use this method to send audio files, if you want Telegram clients to display the
     * file as a playable voice message. For this to work, your audio must be in an
     * .ogg file encoded with OPUS (other formats may be sent as Audio or Document). On
     * success, the sent Message is returned. Bots can currently send voice messages of
     * up to 50 MB in size, this limit may be changed in the future.    
     */
    public async sendVoice (params: SendVoiceParams): Promise<Message>
    {
        return this.request ('sendVoice', params);
    }

    /**
     * As of v.4.0, Telegram clients support rounded square mp4 videos of up to 1
     * minute long. Use this method to send video messages. On success, the sent
     * Message is returned.    
     */
    public async sendVideoNote (params: SendVideoNoteParams): Promise<Message>
    {
        return this.request ('sendVideoNote', params);
    }

    /**
     * Use this method to send a group of photos or videos as an album. On success, an
     * array of the sent Messages is returned.    
     */
    public async sendMediaGroup (params: SendMediaGroupParams): Promise<Array<Message>>
    {
        return this.request ('sendMediaGroup', params);
    }

    /**
     * Use this method to send point on the map. On success, the sent Message is
     * returned.    
     */
    public async sendLocation (params: SendLocationParams): Promise<Message>
    {
        return this.request ('sendLocation', params);
    }

    /**
     * Use this method to edit live location messages sent by the bot or via the bot
     * (for inline bots). A location can be edited until its live_period expires or
     * editing is explicitly disabled by a call to stopMessageLiveLocation. On success,
     * if the edited message was sent by the bot, the edited Message is returned,
     * otherwise True is returned.    
     */
    public async editMessageLiveLocation (params: EditMessageLiveLocationParams): Promise<Message | boolean>
    {
        return this.request ('editMessageLiveLocation', params);
    }

    /**
     * Use this method to stop updating a live location message sent by the bot or via
     * the bot (for inline bots) before live_period expires. On success, if the message
     * was sent by the bot, the sent Message is returned, otherwise True is returned.    
     */
    public async stopMessageLiveLocation (params: StopMessageLiveLocationParams): Promise<Message | boolean>
    {
        return this.request ('stopMessageLiveLocation', params);
    }

    /**
     * Use this method to send information about a venue. On success, the sent Message
     * is returned.    
     */
    public async sendVenue (params: SendVenueParams): Promise<Message>
    {
        return this.request ('sendVenue', params);
    }

    /**
     * Use this method to send phone contacts. On success, the sent Message is
     * returned.    
     */
    public async sendContact (params: SendContactParams): Promise<Message>
    {
        return this.request ('sendContact', params);
    }

    /**
     * Use this method when you need to tell the user that something is happening on
     * the bot's side. The status is set for 5 seconds or less (when a message arrives
     * from your bot, Telegram clients clear its typing status). Returns True on
     * success.Example: The ImageBot needs some time to process a request and upload
     * the image. Instead of sending a text message along the lines of “Retrieving
     * image, please wait…”, the bot may use sendChatAction with action = upload_photo.
     * The user will see a “sending photo” status for the bot. We only recommend using
     * this method when a response from the bot will take a noticeable amount of time
     * to arrive.    
     */
    public async sendChatAction (params: SendChatActionParams): Promise<boolean>
    {
        return this.request ('sendChatAction', params);
    }

    /**
     * Use this method to get a list of profile pictures for a user. Returns a
     * UserProfilePhotos object.    
     */
    public async getUserProfilePhotos (params: GetUserProfilePhotosParams): Promise<UserProfilePhotos>
    {
        return this.request ('getUserProfilePhotos', params);
    }

    /**
     * Use this method to get basic info about a file and prepare it for downloading.
     * For the moment, bots can download files of up to 20MB in size. On success, a
     * File object is returned. The file can then be downloaded via the link
     * https://api.telegram.org/file/bot<token>/<file_path>, where <file_path> is taken
     * from the response. It is guaranteed that the link will be valid for at least 1
     * hour. When the link expires, a new one can be requested by calling getFile
     * again.    
     */
    public async getFile (params: GetFileParams): Promise<File>
    {
        return this.request ('getFile', params);
    }

    /**
     * Use this method to kick a user from a group, a supergroup or a channel. In the
     * case of supergroups and channels, the user will not be able to return to the
     * group on their own using invite links, etc., unless unbanned first. The bot must
     * be an administrator in the chat for this to work and must have the appropriate
     * admin rights. Returns True on success.Note: In regular groups (non-supergroups),
     * this method will only work if the ‘All Members Are Admins’ setting is off in the
     * target group. Otherwise members may only be removed by the group's creator or by
     * the member that added them.     
     */
    public async kickChatMember (params: KickChatMemberParams): Promise<boolean>
    {
        return this.request ('kickChatMember', params);
    }

    /**
     * Use this method to unban a previously kicked user in a supergroup or channel.
     * The user will not return to the group or channel automatically, but will be able
     * to join via link, etc. The bot must be an administrator for this to work.
     * Returns True on success.    
     */
    public async unbanChatMember (params: UnbanChatMemberParams): Promise<boolean>
    {
        return this.request ('unbanChatMember', params);
    }

    /**
     * Use this method to restrict a user in a supergroup. The bot must be an
     * administrator in the supergroup for this to work and must have the appropriate
     * admin rights. Pass True for all boolean parameters to lift restrictions from a
     * user. Returns True on success.    
     */
    public async restrictChatMember (params: RestrictChatMemberParams): Promise<boolean>
    {
        return this.request ('restrictChatMember', params);
    }

    /**
     * Use this method to promote or demote a user in a supergroup or a channel. The
     * bot must be an administrator in the chat for this to work and must have the
     * appropriate admin rights. Pass False for all boolean parameters to demote a
     * user. Returns True on success.    
     */
    public async promoteChatMember (params: PromoteChatMemberParams): Promise<boolean>
    {
        return this.request ('promoteChatMember', params);
    }

    /**
     * Use this method to generate a new invite link for a chat; any previously
     * generated link is revoked. The bot must be an administrator in the chat for this
     * to work and must have the appropriate admin rights. Returns the new invite link
     * as String on success.    
     */
    public async exportChatInviteLink (params: ExportChatInviteLinkParams): Promise<string>
    {
        return this.request ('exportChatInviteLink', params);
    }

    /**
     * Use this method to set a new profile photo for the chat. Photos can't be changed
     * for private chats. The bot must be an administrator in the chat for this to work
     * and must have the appropriate admin rights. Returns True on success.Note: In
     * regular groups (non-supergroups), this method will only work if the ‘All Members
     * Are Admins’ setting is off in the target group.     
     */
    public async setChatPhoto (params: SetChatPhotoParams): Promise<boolean>
    {
        return this.request ('setChatPhoto', params);
    }

    /**
     * Use this method to delete a chat photo. Photos can't be changed for private
     * chats. The bot must be an administrator in the chat for this to work and must
     * have the appropriate admin rights. Returns True on success.Note: In regular
     * groups (non-supergroups), this method will only work if the ‘All Members Are
     * Admins’ setting is off in the target group.     
     */
    public async deleteChatPhoto (params: DeleteChatPhotoParams): Promise<boolean>
    {
        return this.request ('deleteChatPhoto', params);
    }

    /**
     * Use this method to change the title of a chat. Titles can't be changed for
     * private chats. The bot must be an administrator in the chat for this to work and
     * must have the appropriate admin rights. Returns True on success.Note: In regular
     * groups (non-supergroups), this method will only work if the ‘All Members Are
     * Admins’ setting is off in the target group.     
     */
    public async setChatTitle (params: SetChatTitleParams): Promise<boolean>
    {
        return this.request ('setChatTitle', params);
    }

    /**
     * Use this method to change the description of a supergroup or a channel. The bot
     * must be an administrator in the chat for this to work and must have the
     * appropriate admin rights. Returns True on success.    
     */
    public async setChatDescription (params: SetChatDescriptionParams): Promise<boolean>
    {
        return this.request ('setChatDescription', params);
    }

    /**
     * Use this method to pin a message in a supergroup or a channel. The bot must be
     * an administrator in the chat for this to work and must have the
     * ‘can_pin_messages’ admin right in the supergroup or ‘can_edit_messages’ admin
     * right in the channel. Returns True on success.    
     */
    public async pinChatMessage (params: PinChatMessageParams): Promise<boolean>
    {
        return this.request ('pinChatMessage', params);
    }

    /**
     * Use this method to unpin a message in a supergroup or a channel. The bot must be
     * an administrator in the chat for this to work and must have the
     * ‘can_pin_messages’ admin right in the supergroup or ‘can_edit_messages’ admin
     * right in the channel. Returns True on success.    
     */
    public async unpinChatMessage (params: UnpinChatMessageParams): Promise<boolean>
    {
        return this.request ('unpinChatMessage', params);
    }

    /**
     * Use this method for your bot to leave a group, supergroup or channel. Returns
     * True on success.    
     */
    public async leaveChat (params: LeaveChatParams): Promise<boolean>
    {
        return this.request ('leaveChat', params);
    }

    /**
     * Use this method to get up to date information about the chat (current name of
     * the user for one-on-one conversations, current username of a user, group or
     * channel, etc.). Returns a Chat object on success.    
     */
    public async getChat (params: GetChatParams): Promise<Chat>
    {
        return this.request ('getChat', params);
    }

    /**
     * Use this method to get a list of administrators in a chat. On success, returns
     * an Array of ChatMember objects that contains information about all chat
     * administrators except other bots. If the chat is a group or a supergroup and no
     * administrators were appointed, only the creator will be returned.    
     */
    public async getChatAdministrators (params: GetChatAdministratorsParams): Promise<Array<ChatMember>>
    {
        return this.request ('getChatAdministrators', params);
    }

    /**
     * Use this method to get the number of members in a chat. Returns Int on success.    
     */
    public async getChatMembersCount (params: GetChatMembersCountParams): Promise<number>
    {
        return this.request ('getChatMembersCount', params);
    }

    /**
     * Use this method to get information about a member of a chat. Returns a
     * ChatMember object on success.    
     */
    public async getChatMember (params: GetChatMemberParams): Promise<ChatMember>
    {
        return this.request ('getChatMember', params);
    }

    /**
     * Use this method to set a new group sticker set for a supergroup. The bot must be
     * an administrator in the chat for this to work and must have the appropriate
     * admin rights. Use the field can_set_sticker_set optionally returned in getChat
     * requests to check if the bot can use this method. Returns True on success.    
     */
    public async setChatStickerSet (params: SetChatStickerSetParams): Promise<boolean>
    {
        return this.request ('setChatStickerSet', params);
    }

    /**
     * Use this method to delete a group sticker set from a supergroup. The bot must be
     * an administrator in the chat for this to work and must have the appropriate
     * admin rights. Use the field can_set_sticker_set optionally returned in getChat
     * requests to check if the bot can use this method. Returns True on success.    
     */
    public async deleteChatStickerSet (params: DeleteChatStickerSetParams): Promise<boolean>
    {
        return this.request ('deleteChatStickerSet', params);
    }

    /**
     * Use this method to send answers to callback queries sent from inline keyboards.
     * The answer will be displayed to the user as a notification at the top of the
     * chat screen or as an alert. On success, True is returned.Alternatively, the user
     * can be redirected to the specified Game URL. For this option to work, you must
     * first create a game for your bot via @Botfather and accept the terms. Otherwise,
     * you may use links like t.me/your_bot?start=XXXX that open your bot with a
     * parameter.     
     */
    public async answerCallbackQuery (params: AnswerCallbackQueryParams): Promise<boolean>
    {
        return this.request ('answerCallbackQuery', params);
    }

    /**
     * Use this method to edit text and game messages sent by the bot or via the bot
     * (for inline bots). On success, if edited message is sent by the bot, the edited
     * Message is returned, otherwise True is returned.    
     */
    public async editMessageText (params: EditMessageTextParams): Promise<Message | boolean>
    {
        return this.request ('editMessageText', params);
    }

    /**
     * Use this method to edit captions of messages sent by the bot or via the bot (for
     * inline bots). On success, if edited message is sent by the bot, the edited
     * Message is returned, otherwise True is returned.    
     */
    public async editMessageCaption (params: EditMessageCaptionParams): Promise<Message | boolean>
    {
        return this.request ('editMessageCaption', params);
    }

    /**
     * Use this method to edit audio, document, photo, or video messages. If a message
     * is a part of a message album, then it can be edited only to a photo or a video.
     * Otherwise, message type can be changed arbitrarily. When inline message is
     * edited, new file can't be uploaded. Use previously uploaded file via its file_id
     * or specify a URL. On success, if the edited message was sent by the bot, the
     * edited Message is returned, otherwise True is returned.    
     */
    public async editMessageMedia (params: EditMessageMediaParams): Promise<Message | boolean>
    {
        return this.request ('editMessageMedia', params);
    }

    /**
     * Use this method to edit only the reply markup of messages sent by the bot or via
     * the bot (for inline bots). On success, if edited message is sent by the bot, the
     * edited Message is returned, otherwise True is returned.    
     */
    public async editMessageReplyMarkup (params: EditMessageReplyMarkupParams): Promise<Message | boolean>
    {
        return this.request ('editMessageReplyMarkup', params);
    }

    /**
     * Use this method to delete a message, including service messages, with the
     * following limitations: - A message can only be deleted if it was sent less than
     * 48 hours ago. - Bots can delete outgoing messages in groups and supergroups. -
     * Bots granted can_post_messages permissions can delete outgoing messages in
     * channels. - If the bot is an administrator of a group, it can delete any message
     * there. - If the bot has can_delete_messages permission in a supergroup or a
     * channel, it can delete any message there. Returns True on success.    
     */
    public async deleteMessage (params: DeleteMessageParams): Promise<boolean>
    {
        return this.request ('deleteMessage', params);
    }

    /**
     * Use this method to send .webp stickers. On success, the sent Message is
     * returned.    
     */
    public async sendSticker (params: SendStickerParams): Promise<Message>
    {
        return this.request ('sendSticker', params);
    }

    /**
     * Use this method to get a sticker set. On success, a StickerSet object is
     * returned.    
     */
    public async getStickerSet (params: GetStickerSetParams): Promise<StickerSet>
    {
        return this.request ('getStickerSet', params);
    }

    /**
     * Use this method to upload a .png file with a sticker for later use in
     * createNewStickerSet and addStickerToSet methods (can be used multiple times).
     * Returns the uploaded File on success.    
     */
    public async uploadStickerFile (params: UploadStickerFileParams): Promise<File>
    {
        return this.request ('uploadStickerFile', params);
    }

    /**
     * Use this method to create new sticker set owned by a user. The bot will be able
     * to edit the created sticker set. Returns True on success.    
     */
    public async createNewStickerSet (params: CreateNewStickerSetParams): Promise<boolean>
    {
        return this.request ('createNewStickerSet', params);
    }

    /**
     * Use this method to add a new sticker to a set created by the bot. Returns True
     * on success.    
     */
    public async addStickerToSet (params: AddStickerToSetParams): Promise<boolean>
    {
        return this.request ('addStickerToSet', params);
    }

    /**
     * Use this method to move a sticker in a set created by the bot to a specific
     * position . Returns True on success.    
     */
    public async setStickerPositionInSet (params: SetStickerPositionInSetParams): Promise<boolean>
    {
        return this.request ('setStickerPositionInSet', params);
    }

    /**
     * Use this method to delete a sticker from a set created by the bot. Returns True
     * on success.    
     */
    public async deleteStickerFromSet (params: DeleteStickerFromSetParams): Promise<boolean>
    {
        return this.request ('deleteStickerFromSet', params);
    }

    /**
     * Use this method to send answers to an inline query. On success, True is
     * returned. No more than 50 results per query are allowed.    
     */
    public async answerInlineQuery (params: AnswerInlineQueryParams): Promise<boolean>
    {
        return this.request ('answerInlineQuery', params);
    }

    /**
     * Use this method to send invoices. On success, the sent Message is returned.    
     */
    public async sendInvoice (params: SendInvoiceParams): Promise<Message>
    {
        return this.request ('sendInvoice', params);
    }

    /**
     * If you sent an invoice requesting a shipping address and the parameter
     * is_flexible was specified, the Bot API will send an Update with a shipping_query
     * field to the bot. Use this method to reply to shipping queries. On success, True
     * is returned.    
     */
    public async answerShippingQuery (params: AnswerShippingQueryParams): Promise<boolean>
    {
        return this.request ('answerShippingQuery', params);
    }

    /**
     * Once the user has confirmed their payment and shipping details, the Bot API
     * sends the final confirmation in the form of an Update with the field
     * pre_checkout_query. Use this method to respond to such pre-checkout queries. On
     * success, True is returned. Note: The Bot API must receive an answer within 10
     * seconds after the pre-checkout query was sent.    
     */
    public async answerPreCheckoutQuery (params: AnswerPreCheckoutQueryParams): Promise<boolean>
    {
        return this.request ('answerPreCheckoutQuery', params);
    }

    /**
     * Informs a user that some of the Telegram Passport elements they provided
     * contains errors. The user will not be able to re-submit their Passport to you
     * until the errors are fixed (the contents of the field for which you returned the
     * error must change). Returns True on success.Use this if the data submitted by
     * the user doesn't satisfy the standards your service requires for any reason. For
     * example, if a birthday date seems invalid, a submitted document is blurry, a
     * scan shows evidence of tampering, etc. Supply some details in the error message
     * to make sure the user knows how to correct the issues.    
     */
    public async setPassportDataErrors (params: SetPassportDataErrorsParams): Promise<boolean>
    {
        return this.request ('setPassportDataErrors', params);
    }

    /**
     * Use this method to send a game. On success, the sent Message is returned.    
     */
    public async sendGame (params: SendGameParams): Promise<Message>
    {
        return this.request ('sendGame', params);
    }

    /**
     * Use this method to set the score of the specified user in a game. On success, if
     * the message was sent by the bot, returns the edited Message, otherwise returns
     * True. Returns an error, if the new score is not greater than the user's current
     * score in the chat and force is False.    
     */
    public async setGameScore (params: SetGameScoreParams): Promise<Message | boolean>
    {
        return this.request ('setGameScore', params);
    }

    /**
     * Use this method to get data for high score tables. Will return the score of the
     * specified user and several of his neighbors in a game. On success, returns an
     * Array of GameHighScore objects.This method will currently return scores for the
     * target user, plus two of his closest neighbors on each side. Will also return
     * the top three users if the user and his neighbors are not among them. Please
     * note that this behavior is subject to change.     
     */
    public async getGameHighScores (params: GetGameHighScoresParams): Promise<Array<GameHighScore>>
    {
        return this.request ('getGameHighScores', params);
    }

}


/**
 * This object represents an incoming update. At most one of the optional
 * parameters can be present in any given update.
 */
export interface Update
{

    /**
     * The update‘s unique identifier. Update identifiers start from a certain positive
     * number and increase sequentially. This ID becomes especially handy if you’re
     * using Webhooks, since it allows you to ignore repeated updates or to restore the
     * correct update sequence, should they get out of order. If there are no new
     * updates for at least a week, then identifier of the next update will be chosen
     * randomly instead of sequentially.    
     */
    update_id: number,

    /**
     * Optional. New incoming message of any kind — text, photo, sticker, etc.    
     */
    message?: Message,

    /**
     * Optional. New version of a message that is known to the bot and was edited    
     */
    edited_message?: Message,

    /**
     * Optional. New incoming channel post of any kind — text, photo, sticker, etc.    
     */
    channel_post?: Message,

    /**
     * Optional. New version of a channel post that is known to the bot and was edited    
     */
    edited_channel_post?: Message,

    /**
     * Optional. New incoming inline query    
     */
    inline_query?: InlineQuery,

    /**
     * Optional. The result of an inline query that was chosen by a user and sent to
     * their chat partner. Please see our documentation on the feedback collecting for
     * details on how to enable these updates for your bot.    
     */
    chosen_inline_result?: ChosenInlineResult,

    /**
     * Optional. New incoming callback query    
     */
    callback_query?: CallbackQuery,

    /**
     * Optional. New incoming shipping query. Only for invoices with flexible price    
     */
    shipping_query?: ShippingQuery,

    /**
     * Optional. New incoming pre-checkout query. Contains full information about
     * checkout    
     */
    pre_checkout_query?: PreCheckoutQuery,
}

/**
 * Use this method to receive incoming updates using long polling (wiki). An Array
 * of Update objects is returned.
 */
export interface GetUpdatesParams
{

    /**
     * Identifier of the first update to be returned. Must be greater by one than the
     * highest among the identifiers of previously received updates. By default,
     * updates starting with the earliest unconfirmed update are returned. An update is
     * considered confirmed as soon as getUpdates is called with an offset higher than
     * its update_id. The negative offset can be specified to retrieve updates starting
     * from -offset update from the end of the updates queue. All previous updates will
     * forgotten.    
     */
    offset?: number,

    /**
     * Limits the number of updates to be retrieved. Values between 1—100 are accepted.
     * Defaults to 100.    
     */
    limit?: number,

    /**
     * Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling.
     * Should be positive, short polling should be used for testing purposes only.    
     */
    timeout?: number,

    /**
     * List the types of updates you want your bot to receive. For example, specify
     * [“message”, “edited_channel_post”, “callback_query”] to only receive updates of
     * these types. See Update for a complete list of available update types. Specify
     * an empty list to receive all updates regardless of type (default). If not
     * specified, the previous setting will be used. Please note that this parameter
     * doesn't affect updates created before the call to the getUpdates, so unwanted
     * updates may be received for a short period of time.    
     */
    allowed_updates?: Array<string>,
}

/**
 * Use this method to specify a url and receive incoming updates via an outgoing
 * webhook. Whenever there is an update for the bot, we will send an HTTPS POST
 * request to the specified url, containing a JSON-serialized Update. In case of an
 * unsuccessful request, we will give up after a reasonable amount of attempts.
 * Returns True on success.If you'd like to make sure that the Webhook request
 * comes from Telegram, we recommend using a secret path in the URL, e.g.
 * https://www.example.com/<token>. Since nobody else knows your bot‘s token, you
 * can be pretty sure it’s us.
 */
export interface SetWebhookParams
{

    /**
     * HTTPS url to send updates to. Use an empty string to remove webhook integration    
     */
    url: string,

    /**
     * Upload your public key certificate so that the root certificate in use can be
     * checked. See our self-signed guide for details.    
     */
    certificate?: { name: string, data: Buffer },

    /**
     * Maximum allowed number of simultaneous HTTPS connections to the webhook for
     * update delivery, 1-100. Defaults to 40. Use lower values to limit the load on
     * your bot‘s server, and higher values to increase your bot’s throughput.    
     */
    max_connections?: number,

    /**
     * List the types of updates you want your bot to receive. For example, specify
     * [“message”, “edited_channel_post”, “callback_query”] to only receive updates of
     * these types. See Update for a complete list of available update types. Specify
     * an empty list to receive all updates regardless of type (default). If not
     * specified, the previous setting will be used. Please note that this parameter
     * doesn't affect updates created before the call to the setWebhook, so unwanted
     * updates may be received for a short period of time.    
     */
    allowed_updates?: Array<string>,
}

/**
 * Contains information about the current status of a webhook.
 */
export interface WebhookInfo
{

    /**
     * Webhook URL, may be empty if webhook is not set up    
     */
    url: string,

    /**
     * True, if a custom certificate was provided for webhook certificate checks    
     */
    has_custom_certificate: boolean,

    /**
     * Number of updates awaiting delivery    
     */
    pending_update_count: number,

    /**
     * Optional. Unix time for the most recent error that happened when trying to
     * deliver an update via webhook    
     */
    last_error_date?: number,

    /**
     * Optional. Error message in human-readable format for the most recent error that
     * happened when trying to deliver an update via webhook    
     */
    last_error_message?: string,

    /**
     * Optional. Maximum allowed number of simultaneous HTTPS connections to the
     * webhook for update delivery    
     */
    max_connections?: number,

    /**
     * Optional. A list of update types the bot is subscribed to. Defaults to all
     * update types    
     */
    allowed_updates?: Array<string>,
}

/**
 * This object represents a Telegram user or bot.
 */
export interface User
{

    /**
     * Unique identifier for this user or bot    
     */
    id: number,

    /**
     * True, if this user is a bot    
     */
    is_bot: boolean,

    /**
     * User‘s or bot’s first name    
     */
    first_name: string,

    /**
     * Optional. User‘s or bot’s last name    
     */
    last_name?: string,

    /**
     * Optional. User‘s or bot’s username    
     */
    username?: string,

    /**
     * Optional. IETF language tag of the user's language    
     */
    language_code?: string,
}

/**
 * This object represents a chat.
 */
export interface Chat
{

    /**
     * Unique identifier for this chat. This number may be greater than 32 bits and
     * some programming languages may have difficulty/silent defects in interpreting
     * it. But it is smaller than 52 bits, so a signed 64 bit integer or
     * double-precision float type are safe for storing this identifier.    
     */
    id: number,

    /**
     * Type of chat, can be either “private”, “group”, “supergroup” or “channel”    
     */
    type: string,

    /**
     * Optional. Title, for supergroups, channels and group chats    
     */
    title?: string,

    /**
     * Optional. Username, for private chats, supergroups and channels if available    
     */
    username?: string,

    /**
     * Optional. First name of the other party in a private chat    
     */
    first_name?: string,

    /**
     * Optional. Last name of the other party in a private chat    
     */
    last_name?: string,

    /**
     * Optional. True if a group has ‘All Members Are Admins’ enabled.    
     */
    all_members_are_administrators?: boolean,

    /**
     * Optional. Chat photo. Returned only in getChat.    
     */
    photo?: ChatPhoto,

    /**
     * Optional. Description, for supergroups and channel chats. Returned only in
     * getChat.    
     */
    description?: string,

    /**
     * Optional. Chat invite link, for supergroups and channel chats. Returned only in
     * getChat.    
     */
    invite_link?: string,

    /**
     * Optional. Pinned message, for supergroups and channel chats. Returned only in
     * getChat.    
     */
    pinned_message?: Message,

    /**
     * Optional. For supergroups, name of group sticker set. Returned only in getChat.    
     */
    sticker_set_name?: string,

    /**
     * Optional. True, if the bot can change the group sticker set. Returned only in
     * getChat.    
     */
    can_set_sticker_set?: boolean,
}

/**
 * This object represents a message.
 */
export interface Message
{

    /**
     * Unique message identifier inside this chat    
     */
    message_id: number,

    /**
     * Optional. Sender, empty for messages sent to channels    
     */
    from?: User,

    /**
     * Date the message was sent in Unix time    
     */
    date: number,

    /**
     * Conversation the message belongs to    
     */
    chat: Chat,

    /**
     * Optional. For forwarded messages, sender of the original message    
     */
    forward_from?: User,

    /**
     * Optional. For messages forwarded from channels, information about the original
     * channel    
     */
    forward_from_chat?: Chat,

    /**
     * Optional. For messages forwarded from channels, identifier of the original
     * message in the channel    
     */
    forward_from_message_id?: number,

    /**
     * Optional. For messages forwarded from channels, signature of the post author if
     * present    
     */
    forward_signature?: string,

    /**
     * Optional. For forwarded messages, date the original message was sent in Unix
     * time    
     */
    forward_date?: number,

    /**
     * Optional. For replies, the original message. Note that the Message object in
     * this field will not contain further reply_to_message fields even if it itself is
     * a reply.    
     */
    reply_to_message?: Message,

    /**
     * Optional. Date the message was last edited in Unix time    
     */
    edit_date?: number,

    /**
     * Optional. The unique identifier of a media message group this message belongs to    
     */
    media_group_id?: string,

    /**
     * Optional. Signature of the post author for messages in channels    
     */
    author_signature?: string,

    /**
     * Optional. For text messages, the actual UTF-8 text of the message, 0-4096
     * characters.    
     */
    text?: string,

    /**
     * Optional. For text messages, special entities like usernames, URLs, bot
     * commands, etc. that appear in the text    
     */
    entities?: Array<MessageEntity>,

    /**
     * Optional. For messages with a caption, special entities like usernames, URLs,
     * bot commands, etc. that appear in the caption    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Optional. Message is an audio file, information about the file    
     */
    audio?: Audio,

    /**
     * Optional. Message is a general file, information about the file    
     */
    document?: Document,

    /**
     * Optional. Message is an animation, information about the animation. For backward
     * compatibility, when this field is set, the document field will also be set    
     */
    animation?: Animation,

    /**
     * Optional. Message is a game, information about the game. More about games »    
     */
    game?: Game,

    /**
     * Optional. Message is a photo, available sizes of the photo    
     */
    photo?: Array<PhotoSize>,

    /**
     * Optional. Message is a sticker, information about the sticker    
     */
    sticker?: Sticker,

    /**
     * Optional. Message is a video, information about the video    
     */
    video?: Video,

    /**
     * Optional. Message is a voice message, information about the file    
     */
    voice?: Voice,

    /**
     * Optional. Message is a video note, information about the video message    
     */
    video_note?: VideoNote,

    /**
     * Optional. Caption for the audio, document, photo, video or voice, 0-200
     * characters    
     */
    caption?: string,

    /**
     * Optional. Message is a shared contact, information about the contact    
     */
    contact?: Contact,

    /**
     * Optional. Message is a shared location, information about the location    
     */
    location?: Location,

    /**
     * Optional. Message is a venue, information about the venue    
     */
    venue?: Venue,

    /**
     * Optional. New members that were added to the group or supergroup and information
     * about them (the bot itself may be one of these members)    
     */
    new_chat_members?: Array<User>,

    /**
     * Optional. A member was removed from the group, information about them (this
     * member may be the bot itself)    
     */
    left_chat_member?: User,

    /**
     * Optional. A chat title was changed to this value    
     */
    new_chat_title?: string,

    /**
     * Optional. A chat photo was change to this value    
     */
    new_chat_photo?: Array<PhotoSize>,

    /**
     * Optional. Service message: the chat photo was deleted    
     */
    delete_chat_photo?: boolean,

    /**
     * Optional. Service message: the group has been created    
     */
    group_chat_created?: boolean,

    /**
     * Optional. Service message: the supergroup has been created. This field can‘t be
     * received in a message coming through updates, because bot can’t be a member of a
     * supergroup when it is created. It can only be found in reply_to_message if
     * someone replies to a very first message in a directly created supergroup.    
     */
    supergroup_chat_created?: boolean,

    /**
     * Optional. Service message: the channel has been created. This field can‘t be
     * received in a message coming through updates, because bot can’t be a member of a
     * channel when it is created. It can only be found in reply_to_message if someone
     * replies to a very first message in a channel.    
     */
    channel_chat_created?: boolean,

    /**
     * Optional. The group has been migrated to a supergroup with the specified
     * identifier. This number may be greater than 32 bits and some programming
     * languages may have difficulty/silent defects in interpreting it. But it is
     * smaller than 52 bits, so a signed 64 bit integer or double-precision float type
     * are safe for storing this identifier.    
     */
    migrate_to_chat_id?: number,

    /**
     * Optional. The supergroup has been migrated from a group with the specified
     * identifier. This number may be greater than 32 bits and some programming
     * languages may have difficulty/silent defects in interpreting it. But it is
     * smaller than 52 bits, so a signed 64 bit integer or double-precision float type
     * are safe for storing this identifier.    
     */
    migrate_from_chat_id?: number,

    /**
     * Optional. Specified message was pinned. Note that the Message object in this
     * field will not contain further reply_to_message fields even if it is itself a
     * reply.    
     */
    pinned_message?: Message,

    /**
     * Optional. Message is an invoice for a payment, information about the invoice.
     * More about payments »    
     */
    invoice?: Invoice,

    /**
     * Optional. Message is a service message about a successful payment, information
     * about the payment. More about payments »    
     */
    successful_payment?: SuccessfulPayment,

    /**
     * Optional. The domain name of the website on which the user has logged in. More
     * about Telegram Login »    
     */
    connected_website?: string,

    /**
     * Optional. Telegram Passport data    
     */
    passport_data?: PassportData,
}

/**
 * This object represents one special entity in a text message. For example,
 * hashtags, usernames, URLs, etc.
 */
export interface MessageEntity
{

    /**
     * Type of the entity. Can be mention (@username), hashtag, cashtag, bot_command,
     * url, email, phone_number, bold (bold text), italic (italic text), code
     * (monowidth string), pre (monowidth block), text_link (for clickable text URLs),
     * text_mention (for users without usernames)    
     */
    type: string,

    /**
     * Offset in UTF-16 code units to the start of the entity    
     */
    offset: number,

    /**
     * Length of the entity in UTF-16 code units    
     */
    length: number,

    /**
     * Optional. For “text_link” only, url that will be opened after user taps on the
     * text    
     */
    url?: string,

    /**
     * Optional. For “text_mention” only, the mentioned user    
     */
    user?: User,
}

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 */
export interface PhotoSize
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Photo width    
     */
    width: number,

    /**
     * Photo height    
     */
    height: number,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents an audio file to be treated as music by the Telegram
 * clients.
 */
export interface Audio
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Duration of the audio in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. Performer of the audio as defined by sender or by audio tags    
     */
    performer?: string,

    /**
     * Optional. Title of the audio as defined by sender or by audio tags    
     */
    title?: string,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size    
     */
    file_size?: number,

    /**
     * Optional. Thumbnail of the album cover to which the music file belongs    
     */
    thumb?: PhotoSize,
}

/**
 * This object represents a general file (as opposed to photos, voice messages and
 * audio files).
 */
export interface Document
{

    /**
     * Unique file identifier    
     */
    file_id: string,

    /**
     * Optional. Document thumbnail as defined by sender    
     */
    thumb?: PhotoSize,

    /**
     * Optional. Original filename as defined by sender    
     */
    file_name?: string,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents a video file.
 */
export interface Video
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Video width as defined by sender    
     */
    width: number,

    /**
     * Video height as defined by sender    
     */
    height: number,

    /**
     * Duration of the video in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. Video thumbnail    
     */
    thumb?: PhotoSize,

    /**
     * Optional. Mime type of a file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents an animation file (GIF or H.264/MPEG-4 AVC video without
 * sound).
 */
export interface Animation
{

    /**
     * Unique file identifier    
     */
    file_id: string,

    /**
     * Video width as defined by sender    
     */
    width: number,

    /**
     * Video height as defined by sender    
     */
    height: number,

    /**
     * Duration of the video in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. Animation thumbnail as defined by sender    
     */
    thumb?: PhotoSize,

    /**
     * Optional. Original animation filename as defined by sender    
     */
    file_name?: string,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents a voice note.
 */
export interface Voice
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Duration of the audio in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents a video message (available in Telegram apps as of v.4.0).
 */
export interface VideoNote
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Video width and height (diameter of the video message) as defined by sender    
     */
    length: number,

    /**
     * Duration of the video in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. Video thumbnail    
     */
    thumb?: PhotoSize,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents a phone contact.
 */
export interface Contact
{

    /**
     * Contact's phone number    
     */
    phone_number: string,

    /**
     * Contact's first name    
     */
    first_name: string,

    /**
     * Optional. Contact's last name    
     */
    last_name?: string,

    /**
     * Optional. Contact's user identifier in Telegram    
     */
    user_id?: number,

    /**
     * Optional. Additional data about the contact in the form of a vCard    
     */
    vcard?: string,
}

/**
 * This object represents a point on the map.
 */
export interface Location
{

    /**
     * Longitude as defined by sender    
     */
    longitude: number,

    /**
     * Latitude as defined by sender    
     */
    latitude: number,
}

/**
 * This object represents a venue.
 */
export interface Venue
{

    /**
     * Venue location    
     */
    location: Location,

    /**
     * Name of the venue    
     */
    title: string,

    /**
     * Address of the venue    
     */
    address: string,

    /**
     * Optional. Foursquare identifier of the venue    
     */
    foursquare_id?: string,

    /**
     * Optional. Foursquare type of the venue. (For example,
     * “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.)    
     */
    foursquare_type?: string,
}

/**
 * This object represent a user's profile pictures.
 */
export interface UserProfilePhotos
{

    /**
     * Total number of profile pictures the target user has    
     */
    total_count: number,

    /**
     * Requested profile pictures (in up to 4 sizes each)    
     */
    photos: any,
}

/**
 * This object represents a file ready to be downloaded. The file can be downloaded
 * via the link https://api.telegram.org/file/bot<token>/<file_path>. It is
 * guaranteed that the link will be valid for at least 1 hour. When the link
 * expires, a new one can be requested by calling getFile.Maximum file size to
 * download is 20 MB 
 */
export interface File
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Optional. File size, if known    
     */
    file_size?: number,

    /**
     * Optional. File path. Use https://api.telegram.org/file/bot<token>/<file_path> to
     * get the file.    
     */
    file_path?: string,
}

/**
 * This object represents a custom keyboard with reply options (see Introduction to
 * bots for details and examples).
 */
export interface ReplyKeyboardMarkup
{

    /**
     * Array of button rows, each represented by an Array of KeyboardButton objects    
     */
    keyboard: any,

    /**
     * Optional. Requests clients to resize the keyboard vertically for optimal fit
     * (e.g., make the keyboard smaller if there are just two rows of buttons).
     * Defaults to false, in which case the custom keyboard is always of the same
     * height as the app's standard keyboard.    
     */
    resize_keyboard?: boolean,

    /**
     * Optional. Requests clients to hide the keyboard as soon as it's been used. The
     * keyboard will still be available, but clients will automatically display the
     * usual letter-keyboard in the chat – the user can press a special button in the
     * input field to see the custom keyboard again. Defaults to false.    
     */
    one_time_keyboard?: boolean,

    /**
     * Optional. Use this parameter if you want to show the keyboard to specific users
     * only. Targets: 1) users that are @mentioned in the text of the Message object;
     * 2) if the bot's message is a reply (has reply_to_message_id), sender of the
     * original message. Example: A user requests to change the bot‘s language, bot
     * replies to the request with a keyboard to select the new language. Other users
     * in the group don’t see the keyboard.    
     */
    selective?: boolean,
}

/**
 * This object represents one button of the reply keyboard. For simple text buttons
 * String can be used instead of this object to specify text of the button.
 * Optional fields are mutually exclusive.
 */
export interface KeyboardButton
{

    /**
     * Text of the button. If none of the optional fields are used, it will be sent as
     * a message when the button is pressed    
     */
    text: string,

    /**
     * Optional. If True, the user's phone number will be sent as a contact when the
     * button is pressed. Available in private chats only    
     */
    request_contact?: boolean,

    /**
     * Optional. If True, the user's current location will be sent when the button is
     * pressed. Available in private chats only    
     */
    request_location?: boolean,
}

/**
 * Upon receiving a message with this object, Telegram clients will remove the
 * current custom keyboard and display the default letter-keyboard. By default,
 * custom keyboards are displayed until a new keyboard is sent by a bot. An
 * exception is made for one-time keyboards that are hidden immediately after the
 * user presses a button (see ReplyKeyboardMarkup).
 */
export interface ReplyKeyboardRemove
{

    /**
     * Requests clients to remove the custom keyboard (user will not be able to summon
     * this keyboard; if you want to hide the keyboard from sight but keep it
     * accessible, use one_time_keyboard in ReplyKeyboardMarkup)    
     */
    remove_keyboard: boolean,

    /**
     * Optional. Use this parameter if you want to remove the keyboard for specific
     * users only. Targets: 1) users that are @mentioned in the text of the Message
     * object; 2) if the bot's message is a reply (has reply_to_message_id), sender of
     * the original message. Example: A user votes in a poll, bot returns confirmation
     * message in reply to the vote and removes the keyboard for that user, while still
     * showing the keyboard with poll options to users who haven't voted yet.    
     */
    selective?: boolean,
}

/**
 * This object represents an inline keyboard that appears right next to the message
 * it belongs to.
 */
export interface InlineKeyboardMarkup
{

    /**
     * Array of button rows, each represented by an Array of InlineKeyboardButton
     * objects    
     */
    inline_keyboard: any,
}

/**
 * This object represents one button of an inline keyboard. You must use exactly
 * one of the optional fields.
 */
export interface InlineKeyboardButton
{

    /**
     * Label text on the button    
     */
    text: string,

    /**
     * Optional. HTTP or tg:// url to be opened when button is pressed    
     */
    url?: string,

    /**
     * Optional. Data to be sent in a callback query to the bot when button is pressed,
     * 1-64 bytes    
     */
    callback_data?: string,

    /**
     * Optional. If set, pressing the button will prompt the user to select one of
     * their chats, open that chat and insert the bot‘s username and the specified
     * inline query in the input field. Can be empty, in which case just the bot’s
     * username will be inserted. Note: This offers an easy way for users to start
     * using your bot in inline mode when they are currently in a private chat with it.
     * Especially useful when combined with switch_pm… actions – in this case the user
     * will be automatically returned to the chat they switched from, skipping the chat
     * selection screen.    
     */
    switch_inline_query?: string,

    /**
     * Optional. If set, pressing the button will insert the bot‘s username and the
     * specified inline query in the current chat's input field. Can be empty, in which
     * case only the bot’s username will be inserted. This offers a quick way for the
     * user to open your bot in inline mode in the same chat – good for selecting
     * something from multiple options.    
     */
    switch_inline_query_current_chat?: string,

    /**
     * Optional. Description of the game that will be launched when the user presses
     * the button. NOTE: This type of button must always be the first button in the
     * first row.    
     */
    callback_game?: any,

    /**
     * Optional. Specify True, to send a Pay button. NOTE: This type of button must
     * always be the first button in the first row.    
     */
    pay?: boolean,
}

/**
 * This object represents an incoming callback query from a callback button in an
 * inline keyboard. If the button that originated the query was attached to a
 * message sent by the bot, the field message will be present. If the button was
 * attached to a message sent via the bot (in inline mode), the field
 * inline_message_id will be present. Exactly one of the fields data or
 * game_short_name will be present.
 */
export interface CallbackQuery
{

    /**
     * Unique identifier for this query    
     */
    id: string,

    /**
     * Sender    
     */
    from: User,

    /**
     * Optional. Message with the callback button that originated the query. Note that
     * message content and message date will not be available if the message is too old    
     */
    message?: Message,

    /**
     * Optional. Identifier of the message sent via the bot in inline mode, that
     * originated the query.    
     */
    inline_message_id?: string,

    /**
     * Global identifier, uniquely corresponding to the chat to which the message with
     * the callback button was sent. Useful for high scores in games.    
     */
    chat_instance: string,

    /**
     * Optional. Data associated with the callback button. Be aware that a bad client
     * can send arbitrary data in this field.    
     */
    data?: string,

    /**
     * Optional. Short name of a Game to be returned, serves as the unique identifier
     * for the game    
     */
    game_short_name?: string,
}

/**
 * Upon receiving a message with this object, Telegram clients will display a reply
 * interface to the user (act as if the user has selected the bot‘s message and
 * tapped ’Reply'). This can be extremely useful if you want to create
 * user-friendly step-by-step interfaces without having to sacrifice privacy mode.
 */
export interface ForceReply
{

    /**
     * Shows reply interface to the user, as if they manually selected the bot‘s
     * message and tapped ’Reply'    
     */
    force_reply: boolean,

    /**
     * Optional. Use this parameter if you want to force reply from specific users
     * only. Targets: 1) users that are @mentioned in the text of the Message object;
     * 2) if the bot's message is a reply (has reply_to_message_id), sender of the
     * original message.    
     */
    selective?: boolean,
}

/**
 * This object represents a chat photo.
 */
export interface ChatPhoto
{

    /**
     * Unique file identifier of small (160x160) chat photo. This file_id can be used
     * only for photo download.    
     */
    small_file_id: string,

    /**
     * Unique file identifier of big (640x640) chat photo. This file_id can be used
     * only for photo download.    
     */
    big_file_id: string,
}

/**
 * This object contains information about one member of a chat.
 */
export interface ChatMember
{

    /**
     * Information about the user    
     */
    user: User,

    /**
     * The member's status in the chat. Can be “creator”, “administrator”, “member”,
     * “restricted”, “left” or “kicked”    
     */
    status: string,

    /**
     * Optional. Restricted and kicked only. Date when restrictions will be lifted for
     * this user, unix time    
     */
    until_date?: number,

    /**
     * Optional. Administrators only. True, if the bot is allowed to edit administrator
     * privileges of that user    
     */
    can_be_edited?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can change the chat
     * title, photo and other settings    
     */
    can_change_info?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can post in the
     * channel, channels only    
     */
    can_post_messages?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can edit messages of
     * other users and can pin messages, channels only    
     */
    can_edit_messages?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can delete messages of
     * other users    
     */
    can_delete_messages?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can invite new users
     * to the chat    
     */
    can_invite_users?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can restrict, ban or
     * unban chat members    
     */
    can_restrict_members?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can pin messages,
     * supergroups only    
     */
    can_pin_messages?: boolean,

    /**
     * Optional. Administrators only. True, if the administrator can add new
     * administrators with a subset of his own privileges or demote administrators that
     * he has promoted, directly or indirectly (promoted by administrators that were
     * appointed by the user)    
     */
    can_promote_members?: boolean,

    /**
     * Optional. Restricted only. True, if the user can send text messages, contacts,
     * locations and venues    
     */
    can_send_messages?: boolean,

    /**
     * Optional. Restricted only. True, if the user can send audios, documents, photos,
     * videos, video notes and voice notes, implies can_send_messages    
     */
    can_send_media_messages?: boolean,

    /**
     * Optional. Restricted only. True, if the user can send animations, games,
     * stickers and use inline bots, implies can_send_media_messages    
     */
    can_send_other_messages?: boolean,

    /**
     * Optional. Restricted only. True, if user may add web page previews to his
     * messages, implies can_send_media_messages    
     */
    can_add_web_page_previews?: boolean,
}

/**
 * Contains information about why a request was unsuccessful.
 */
export interface ResponseParameters
{

    /**
     * Optional. The group has been migrated to a supergroup with the specified
     * identifier. This number may be greater than 32 bits and some programming
     * languages may have difficulty/silent defects in interpreting it. But it is
     * smaller than 52 bits, so a signed 64 bit integer or double-precision float type
     * are safe for storing this identifier.    
     */
    migrate_to_chat_id?: number,

    /**
     * Optional. In case of exceeding flood control, the number of seconds left to wait
     * before the request can be repeated    
     */
    retry_after?: number,
}

/**
 * Represents a photo to be sent.
 */
export interface InputMediaPhoto extends InputMedia
{

    /**
     * Type of the result, must be photo    
     */
    type: string,

    /**
     * File to send. Pass a file_id to send a file that exists on the Telegram servers
     * (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or
     * pass “attach://<file_attach_name>” to upload a new one using multipart/form-data
     * under <file_attach_name> name. More info on Sending Files »    
     */
    media: string,

    /**
     * Optional. Caption of the photo to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,
}

/**
 * Represents a video to be sent.
 */
export interface InputMediaVideo extends InputMedia
{

    /**
     * Type of the result, must be video    
     */
    type: string,

    /**
     * File to send. Pass a file_id to send a file that exists on the Telegram servers
     * (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or
     * pass “attach://<file_attach_name>” to upload a new one using multipart/form-data
     * under <file_attach_name> name. More info on Sending Files »    
     */
    media: string,

    /**
     * Optional. Thumbnail of the file sent. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail‘s width and height should not exceed 90.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can’t
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the video to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Video width    
     */
    width?: number,

    /**
     * Optional. Video height    
     */
    height?: number,

    /**
     * Optional. Video duration    
     */
    duration?: number,

    /**
     * Optional. Pass True, if the uploaded video is suitable for streaming    
     */
    supports_streaming?: boolean,
}

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be
 * sent.
 */
export interface InputMediaAnimation extends InputMedia
{

    /**
     * Type of the result, must be animation    
     */
    type: string,

    /**
     * File to send. Pass a file_id to send a file that exists on the Telegram servers
     * (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or
     * pass “attach://<file_attach_name>” to upload a new one using multipart/form-data
     * under <file_attach_name> name. More info on Sending Files »    
     */
    media: string,

    /**
     * Optional. Thumbnail of the file sent. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail‘s width and height should not exceed 90.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can’t
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the animation to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Animation width    
     */
    width?: number,

    /**
     * Optional. Animation height    
     */
    height?: number,

    /**
     * Optional. Animation duration    
     */
    duration?: number,
}

/**
 * Represents an audio file to be treated as music to be sent.
 */
export interface InputMediaAudio extends InputMedia
{

    /**
     * Type of the result, must be audio    
     */
    type: string,

    /**
     * File to send. Pass a file_id to send a file that exists on the Telegram servers
     * (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or
     * pass “attach://<file_attach_name>” to upload a new one using multipart/form-data
     * under <file_attach_name> name. More info on Sending Files »    
     */
    media: string,

    /**
     * Optional. Thumbnail of the file sent. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail‘s width and height should not exceed 90.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can’t
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the audio to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Duration of the audio in seconds    
     */
    duration?: number,

    /**
     * Optional. Performer of the audio    
     */
    performer?: string,

    /**
     * Optional. Title of the audio    
     */
    title?: string,
}

/**
 * Represents a general file to be sent.
 */
export interface InputMediaDocument extends InputMedia
{

    /**
     * Type of the result, must be document    
     */
    type: string,

    /**
     * File to send. Pass a file_id to send a file that exists on the Telegram servers
     * (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or
     * pass “attach://<file_attach_name>” to upload a new one using multipart/form-data
     * under <file_attach_name> name. More info on Sending Files »    
     */
    media: string,

    /**
     * Optional. Thumbnail of the file sent. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail‘s width and height should not exceed 90.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can’t
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the document to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,
}

/**
 * Use this method to send text messages. On success, the sent Message is returned.
 */
export interface SendMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Text of the message to be sent    
     */
    text: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in your bot's message.    
     */
    parse_mode?: string,

    /**
     * Disables link previews for links in this message    
     */
    disable_web_page_preview?: boolean,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to forward messages of any kind. On success, the sent Message is
 * returned.
 */
export interface ForwardMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier for the chat where the original message was sent (or channel
     * username in the format @channelusername)    
     */
    from_chat_id: number | string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * Message identifier in the chat specified in from_chat_id    
     */
    message_id: number,
}

/**
 * Use this method to send photos. On success, the sent Message is returned.
 */
export interface SendPhotoParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Photo to send. Pass a file_id as String to send a photo that exists on the
     * Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get
     * a photo from the Internet, or upload a new photo using multipart/form-data. More
     * info on Sending Files »    
     */
    photo: { name: string, data: Buffer } | string,

    /**
     * Photo caption (may also be used when resending photos by file_id), 0-200
     * characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send audio files, if you want Telegram clients to display
 * them in the music player. Your audio must be in the .mp3 format. On success, the
 * sent Message is returned. Bots can currently send audio files of up to 50 MB in
 * size, this limit may be changed in the future.For sending voice messages, use
 * the sendVoice method instead.
 */
export interface SendAudioParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Audio file to send. Pass a file_id as String to send an audio file that exists
     * on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram
     * to get an audio file from the Internet, or upload a new one using
     * multipart/form-data. More info on Sending Files »    
     */
    audio: { name: string, data: Buffer } | string,

    /**
     * Audio caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Duration of the audio in seconds    
     */
    duration?: number,

    /**
     * Performer    
     */
    performer?: string,

    /**
     * Track name    
     */
    title?: string,

    /**
     * Thumbnail of the file sent. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail‘s width and height should not exceed 90. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can’t be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send general files. On success, the sent Message is returned.
 * Bots can currently send files of any type of up to 50 MB in size, this limit may
 * be changed in the future.
 */
export interface SendDocumentParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * File to send. Pass a file_id as String to send a file that exists on the
     * Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get
     * a file from the Internet, or upload a new one using multipart/form-data. More
     * info on Sending Files »    
     */
    document: { name: string, data: Buffer } | string,

    /**
     * Thumbnail of the file sent. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail‘s width and height should not exceed 90. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can’t be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Document caption (may also be used when resending documents by file_id), 0-200
     * characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send video files, Telegram clients support mp4 videos (other
 * formats may be sent as Document). On success, the sent Message is returned. Bots
 * can currently send video files of up to 50 MB in size, this limit may be changed
 * in the future.
 */
export interface SendVideoParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Video to send. Pass a file_id as String to send a video that exists on the
     * Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get
     * a video from the Internet, or upload a new video using multipart/form-data. More
     * info on Sending Files »    
     */
    video: { name: string, data: Buffer } | string,

    /**
     * Duration of sent video in seconds    
     */
    duration?: number,

    /**
     * Video width    
     */
    width?: number,

    /**
     * Video height    
     */
    height?: number,

    /**
     * Thumbnail of the file sent. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail‘s width and height should not exceed 90. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can’t be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Video caption (may also be used when resending videos by file_id), 0-200
     * characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Pass True, if the uploaded video is suitable for streaming    
     */
    supports_streaming?: boolean,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without
 * sound). On success, the sent Message is returned. Bots can currently send
 * animation files of up to 50 MB in size, this limit may be changed in the future.
 */
export interface SendAnimationParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Animation to send. Pass a file_id as String to send an animation that exists on
     * the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to
     * get an animation from the Internet, or upload a new animation using
     * multipart/form-data. More info on Sending Files »    
     */
    animation: { name: string, data: Buffer } | string,

    /**
     * Duration of sent animation in seconds    
     */
    duration?: number,

    /**
     * Animation width    
     */
    width?: number,

    /**
     * Animation height    
     */
    height?: number,

    /**
     * Thumbnail of the file sent. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail‘s width and height should not exceed 90. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can’t be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Animation caption (may also be used when resending animation by file_id), 0-200
     * characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send audio files, if you want Telegram clients to display the
 * file as a playable voice message. For this to work, your audio must be in an
 * .ogg file encoded with OPUS (other formats may be sent as Audio or Document). On
 * success, the sent Message is returned. Bots can currently send voice messages of
 * up to 50 MB in size, this limit may be changed in the future.
 */
export interface SendVoiceParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Audio file to send. Pass a file_id as String to send a file that exists on the
     * Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get
     * a file from the Internet, or upload a new one using multipart/form-data. More
     * info on Sending Files »    
     */
    voice: { name: string, data: Buffer } | string,

    /**
     * Voice message caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Duration of the voice message in seconds    
     */
    duration?: number,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * As of v.4.0, Telegram clients support rounded square mp4 videos of up to 1
 * minute long. Use this method to send video messages. On success, the sent
 * Message is returned.
 */
export interface SendVideoNoteParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Video note to send. Pass a file_id as String to send a video note that exists on
     * the Telegram servers (recommended) or upload a new video using
     * multipart/form-data. More info on Sending Files ». Sending video notes by a URL
     * is currently unsupported    
     */
    video_note: { name: string, data: Buffer } | string,

    /**
     * Duration of sent video in seconds    
     */
    duration?: number,

    /**
     * Video width and height, i.e. diameter of the video message    
     */
    length?: number,

    /**
     * Thumbnail of the file sent. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail‘s width and height should not exceed 90. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can’t be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send a group of photos or videos as an album. On success, an
 * array of the sent Messages is returned.
 */
export interface SendMediaGroupParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * A JSON-serialized array describing photos and videos to be sent, must include
     * 2–10 items    
     */
    media: any,

    /**
     * Sends the messages silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the messages are a reply, ID of the original message    
     */
    reply_to_message_id?: number,
}

/**
 * Use this method to send point on the map. On success, the sent Message is
 * returned.
 */
export interface SendLocationParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Latitude of the location    
     */
    latitude: any,

    /**
     * Longitude of the location    
     */
    longitude: any,

    /**
     * Period in seconds for which the location will be updated (see Live Locations,
     * should be between 60 and 86400.    
     */
    live_period?: number,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to edit live location messages sent by the bot or via the bot
 * (for inline bots). A location can be edited until its live_period expires or
 * editing is explicitly disabled by a call to stopMessageLiveLocation. On success,
 * if the edited message was sent by the bot, the edited Message is returned,
 * otherwise True is returned.
 */
export interface EditMessageLiveLocationParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * Latitude of new location    
     */
    latitude: any,

    /**
     * Longitude of new location    
     */
    longitude: any,

    /**
     * A JSON-serialized object for a new inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to stop updating a live location message sent by the bot or via
 * the bot (for inline bots) before live_period expires. On success, if the message
 * was sent by the bot, the sent Message is returned, otherwise True is returned.
 */
export interface StopMessageLiveLocationParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * A JSON-serialized object for a new inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to send information about a venue. On success, the sent Message
 * is returned.
 */
export interface SendVenueParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Latitude of the venue    
     */
    latitude: any,

    /**
     * Longitude of the venue    
     */
    longitude: any,

    /**
     * Name of the venue    
     */
    title: string,

    /**
     * Address of the venue    
     */
    address: string,

    /**
     * Foursquare identifier of the venue    
     */
    foursquare_id?: string,

    /**
     * Foursquare type of the venue, if known. (For example,
     * “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.)    
     */
    foursquare_type?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send phone contacts. On success, the sent Message is
 * returned.
 */
export interface SendContactParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Contact's phone number    
     */
    phone_number: string,

    /**
     * Contact's first name    
     */
    first_name: string,

    /**
     * Contact's last name    
     */
    last_name?: string,

    /**
     * Additional data about the contact in the form of a vCard, 0-2048 bytes    
     */
    vcard?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove keyboard or to force a reply from
     * the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method when you need to tell the user that something is happening on
 * the bot's side. The status is set for 5 seconds or less (when a message arrives
 * from your bot, Telegram clients clear its typing status). Returns True on
 * success.Example: The ImageBot needs some time to process a request and upload
 * the image. Instead of sending a text message along the lines of “Retrieving
 * image, please wait…”, the bot may use sendChatAction with action = upload_photo.
 * The user will see a “sending photo” status for the bot. We only recommend using
 * this method when a response from the bot will take a noticeable amount of time
 * to arrive.
 */
export interface SendChatActionParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Type of action to broadcast. Choose one, depending on what the user is about to
     * receive: typing for text messages, upload_photo for photos, record_video or
     * upload_video for videos, record_audio or upload_audio for audio files,
     * upload_document for general files, find_location for location data,
     * record_video_note or upload_video_note for video notes.    
     */
    action: string,
}

/**
 * Use this method to get a list of profile pictures for a user. Returns a
 * UserProfilePhotos object.
 */
export interface GetUserProfilePhotosParams
{

    /**
     * Unique identifier of the target user    
     */
    user_id: number,

    /**
     * Sequential number of the first photo to be returned. By default, all photos are
     * returned.    
     */
    offset?: number,

    /**
     * Limits the number of photos to be retrieved. Values between 1—100 are accepted.
     * Defaults to 100.    
     */
    limit?: number,
}

/**
 * Use this method to get basic info about a file and prepare it for downloading.
 * For the moment, bots can download files of up to 20MB in size. On success, a
 * File object is returned. The file can then be downloaded via the link
 * https://api.telegram.org/file/bot<token>/<file_path>, where <file_path> is taken
 * from the response. It is guaranteed that the link will be valid for at least 1
 * hour. When the link expires, a new one can be requested by calling getFile
 * again.
 */
export interface GetFileParams
{

    /**
     * File identifier to get info about    
     */
    file_id: string,
}

/**
 * Use this method to kick a user from a group, a supergroup or a channel. In the
 * case of supergroups and channels, the user will not be able to return to the
 * group on their own using invite links, etc., unless unbanned first. The bot must
 * be an administrator in the chat for this to work and must have the appropriate
 * admin rights. Returns True on success.Note: In regular groups (non-supergroups),
 * this method will only work if the ‘All Members Are Admins’ setting is off in the
 * target group. Otherwise members may only be removed by the group's creator or by
 * the member that added them. 
 */
export interface KickChatMemberParams
{

    /**
     * Unique identifier for the target group or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,

    /**
     * Date when the user will be unbanned, unix time. If user is banned for more than
     * 366 days or less than 30 seconds from the current time they are considered to be
     * banned forever    
     */
    until_date?: number,
}

/**
 * Use this method to unban a previously kicked user in a supergroup or channel.
 * The user will not return to the group or channel automatically, but will be able
 * to join via link, etc. The bot must be an administrator for this to work.
 * Returns True on success.
 */
export interface UnbanChatMemberParams
{

    /**
     * Unique identifier for the target group or username of the target supergroup or
     * channel (in the format @username)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,
}

/**
 * Use this method to restrict a user in a supergroup. The bot must be an
 * administrator in the supergroup for this to work and must have the appropriate
 * admin rights. Pass True for all boolean parameters to lift restrictions from a
 * user. Returns True on success.
 */
export interface RestrictChatMemberParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,

    /**
     * Date when restrictions will be lifted for the user, unix time. If user is
     * restricted for more than 366 days or less than 30 seconds from the current time,
     * they are considered to be restricted forever    
     */
    until_date?: number,

    /**
     * Pass True, if the user can send text messages, contacts, locations and venues    
     */
    can_send_messages?: boolean,

    /**
     * Pass True, if the user can send audios, documents, photos, videos, video notes
     * and voice notes, implies can_send_messages    
     */
    can_send_media_messages?: boolean,

    /**
     * Pass True, if the user can send animations, games, stickers and use inline bots,
     * implies can_send_media_messages    
     */
    can_send_other_messages?: boolean,

    /**
     * Pass True, if the user may add web page previews to their messages, implies
     * can_send_media_messages    
     */
    can_add_web_page_previews?: boolean,
}

/**
 * Use this method to promote or demote a user in a supergroup or a channel. The
 * bot must be an administrator in the chat for this to work and must have the
 * appropriate admin rights. Pass False for all boolean parameters to demote a
 * user. Returns True on success.
 */
export interface PromoteChatMemberParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,

    /**
     * Pass True, if the administrator can change chat title, photo and other settings    
     */
    can_change_info?: boolean,

    /**
     * Pass True, if the administrator can create channel posts, channels only    
     */
    can_post_messages?: boolean,

    /**
     * Pass True, if the administrator can edit messages of other users and can pin
     * messages, channels only    
     */
    can_edit_messages?: boolean,

    /**
     * Pass True, if the administrator can delete messages of other users    
     */
    can_delete_messages?: boolean,

    /**
     * Pass True, if the administrator can invite new users to the chat    
     */
    can_invite_users?: boolean,

    /**
     * Pass True, if the administrator can restrict, ban or unban chat members    
     */
    can_restrict_members?: boolean,

    /**
     * Pass True, if the administrator can pin messages, supergroups only    
     */
    can_pin_messages?: boolean,

    /**
     * Pass True, if the administrator can add new administrators with a subset of his
     * own privileges or demote administrators that he has promoted, directly or
     * indirectly (promoted by administrators that were appointed by him)    
     */
    can_promote_members?: boolean,
}

/**
 * Use this method to generate a new invite link for a chat; any previously
 * generated link is revoked. The bot must be an administrator in the chat for this
 * to work and must have the appropriate admin rights. Returns the new invite link
 * as String on success.
 */
export interface ExportChatInviteLinkParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to set a new profile photo for the chat. Photos can't be changed
 * for private chats. The bot must be an administrator in the chat for this to work
 * and must have the appropriate admin rights. Returns True on success.Note: In
 * regular groups (non-supergroups), this method will only work if the ‘All Members
 * Are Admins’ setting is off in the target group. 
 */
export interface SetChatPhotoParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * New chat photo, uploaded using multipart/form-data    
     */
    photo: { name: string, data: Buffer },
}

/**
 * Use this method to delete a chat photo. Photos can't be changed for private
 * chats. The bot must be an administrator in the chat for this to work and must
 * have the appropriate admin rights. Returns True on success.Note: In regular
 * groups (non-supergroups), this method will only work if the ‘All Members Are
 * Admins’ setting is off in the target group. 
 */
export interface DeleteChatPhotoParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to change the title of a chat. Titles can't be changed for
 * private chats. The bot must be an administrator in the chat for this to work and
 * must have the appropriate admin rights. Returns True on success.Note: In regular
 * groups (non-supergroups), this method will only work if the ‘All Members Are
 * Admins’ setting is off in the target group. 
 */
export interface SetChatTitleParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * New chat title, 1-255 characters    
     */
    title: string,
}

/**
 * Use this method to change the description of a supergroup or a channel. The bot
 * must be an administrator in the chat for this to work and must have the
 * appropriate admin rights. Returns True on success.
 */
export interface SetChatDescriptionParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * New chat description, 0-255 characters    
     */
    description?: string,
}

/**
 * Use this method to pin a message in a supergroup or a channel. The bot must be
 * an administrator in the chat for this to work and must have the
 * ‘can_pin_messages’ admin right in the supergroup or ‘can_edit_messages’ admin
 * right in the channel. Returns True on success.
 */
export interface PinChatMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Identifier of a message to pin    
     */
    message_id: number,

    /**
     * Pass True, if it is not necessary to send a notification to all chat members
     * about the new pinned message. Notifications are always disabled in channels.    
     */
    disable_notification?: boolean,
}

/**
 * Use this method to unpin a message in a supergroup or a channel. The bot must be
 * an administrator in the chat for this to work and must have the
 * ‘can_pin_messages’ admin right in the supergroup or ‘can_edit_messages’ admin
 * right in the channel. Returns True on success.
 */
export interface UnpinChatMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method for your bot to leave a group, supergroup or channel. Returns
 * True on success.
 */
export interface LeaveChatParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to get up to date information about the chat (current name of
 * the user for one-on-one conversations, current username of a user, group or
 * channel, etc.). Returns a Chat object on success.
 */
export interface GetChatParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to get a list of administrators in a chat. On success, returns
 * an Array of ChatMember objects that contains information about all chat
 * administrators except other bots. If the chat is a group or a supergroup and no
 * administrators were appointed, only the creator will be returned.
 */
export interface GetChatAdministratorsParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to get the number of members in a chat. Returns Int on success.
 */
export interface GetChatMembersCountParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to get information about a member of a chat. Returns a
 * ChatMember object on success.
 */
export interface GetChatMemberParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup or
     * channel (in the format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,
}

/**
 * Use this method to set a new group sticker set for a supergroup. The bot must be
 * an administrator in the chat for this to work and must have the appropriate
 * admin rights. Use the field can_set_sticker_set optionally returned in getChat
 * requests to check if the bot can use this method. Returns True on success.
 */
export interface SetChatStickerSetParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,

    /**
     * Name of the sticker set to be set as the group sticker set    
     */
    sticker_set_name: string,
}

/**
 * Use this method to delete a group sticker set from a supergroup. The bot must be
 * an administrator in the chat for this to work and must have the appropriate
 * admin rights. Use the field can_set_sticker_set optionally returned in getChat
 * requests to check if the bot can use this method. Returns True on success.
 */
export interface DeleteChatStickerSetParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,
}

/**
 * Use this method to send answers to callback queries sent from inline keyboards.
 * The answer will be displayed to the user as a notification at the top of the
 * chat screen or as an alert. On success, True is returned.Alternatively, the user
 * can be redirected to the specified Game URL. For this option to work, you must
 * first create a game for your bot via @Botfather and accept the terms. Otherwise,
 * you may use links like t.me/your_bot?start=XXXX that open your bot with a
 * parameter. 
 */
export interface AnswerCallbackQueryParams
{

    /**
     * Unique identifier for the query to be answered    
     */
    callback_query_id: string,

    /**
     * Text of the notification. If not specified, nothing will be shown to the user,
     * 0-200 characters    
     */
    text?: string,

    /**
     * If true, an alert will be shown by the client instead of a notification at the
     * top of the chat screen. Defaults to false.    
     */
    show_alert?: boolean,

    /**
     * URL that will be opened by the user's client. If you have created a Game and
     * accepted the conditions via @Botfather, specify the URL that opens your game –
     * note that this will only work if the query comes from a callback_game button.
     * Otherwise, you may use links like t.me/your_bot?start=XXXX that open your bot
     * with a parameter.    
     */
    url?: string,

    /**
     * The maximum amount of time in seconds that the result of the callback query may
     * be cached client-side. Telegram apps will support caching starting in version
     * 3.14. Defaults to 0.    
     */
    cache_time?: number,
}

/**
 * Use this method to edit text and game messages sent by the bot or via the bot
 * (for inline bots). On success, if edited message is sent by the bot, the edited
 * Message is returned, otherwise True is returned.
 */
export interface EditMessageTextParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * New text of the message    
     */
    text: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in your bot's message.    
     */
    parse_mode?: string,

    /**
     * Disables link previews for links in this message    
     */
    disable_web_page_preview?: boolean,

    /**
     * A JSON-serialized object for an inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to edit captions of messages sent by the bot or via the bot (for
 * inline bots). On success, if edited message is sent by the bot, the edited
 * Message is returned, otherwise True is returned.
 */
export interface EditMessageCaptionParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * New caption of the message    
     */
    caption?: string,

    /**
     * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized object for an inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to edit audio, document, photo, or video messages. If a message
 * is a part of a message album, then it can be edited only to a photo or a video.
 * Otherwise, message type can be changed arbitrarily. When inline message is
 * edited, new file can't be uploaded. Use previously uploaded file via its file_id
 * or specify a URL. On success, if the edited message was sent by the bot, the
 * edited Message is returned, otherwise True is returned.
 */
export interface EditMessageMediaParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * A JSON-serialized object for a new media content of the message    
     */
    media: InputMedia,

    /**
     * A JSON-serialized object for a new inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to edit only the reply markup of messages sent by the bot or via
 * the bot (for inline bots). On success, if edited message is sent by the bot, the
 * edited Message is returned, otherwise True is returned.
 */
export interface EditMessageReplyMarkupParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * A JSON-serialized object for an inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to delete a message, including service messages, with the
 * following limitations: - A message can only be deleted if it was sent less than
 * 48 hours ago. - Bots can delete outgoing messages in groups and supergroups. -
 * Bots granted can_post_messages permissions can delete outgoing messages in
 * channels. - If the bot is an administrator of a group, it can delete any message
 * there. - If the bot has can_delete_messages permission in a supergroup or a
 * channel, it can delete any message there. Returns True on success.
 */
export interface DeleteMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Identifier of the message to delete    
     */
    message_id: number,
}

/**
 * This object represents a sticker.
 */
export interface Sticker
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * Sticker width    
     */
    width: number,

    /**
     * Sticker height    
     */
    height: number,

    /**
     * Optional. Sticker thumbnail in the .webp or .jpg format    
     */
    thumb?: PhotoSize,

    /**
     * Optional. Emoji associated with the sticker    
     */
    emoji?: string,

    /**
     * Optional. Name of the sticker set to which the sticker belongs    
     */
    set_name?: string,

    /**
     * Optional. For mask stickers, the position where the mask should be placed    
     */
    mask_position?: MaskPosition,

    /**
     * Optional. File size    
     */
    file_size?: number,
}

/**
 * This object represents a sticker set.
 */
export interface StickerSet
{

    /**
     * Sticker set name    
     */
    name: string,

    /**
     * Sticker set title    
     */
    title: string,

    /**
     * True, if the sticker set contains masks    
     */
    contains_masks: boolean,

    /**
     * List of all set stickers    
     */
    stickers: Array<Sticker>,
}

/**
 * This object describes the position on faces where a mask should be placed by
 * default.
 */
export interface MaskPosition
{

    /**
     * The part of the face relative to which the mask should be placed. One of
     * “forehead”, “eyes”, “mouth”, or “chin”.    
     */
    point: string,

    /**
     * Shift by X-axis measured in widths of the mask scaled to the face size, from
     * left to right. For example, choosing -1.0 will place mask just to the left of
     * the default mask position.    
     */
    x_shift: any,

    /**
     * Shift by Y-axis measured in heights of the mask scaled to the face size, from
     * top to bottom. For example, 1.0 will place the mask just below the default mask
     * position.    
     */
    y_shift: any,

    /**
     * Mask scaling coefficient. For example, 2.0 means double size.    
     */
    scale: any,
}

/**
 * Use this method to send .webp stickers. On success, the sent Message is
 * returned.
 */
export interface SendStickerParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Sticker to send. Pass a file_id as String to send a file that exists on the
     * Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get
     * a .webp file from the Internet, or upload a new one using multipart/form-data.
     * More info on Sending Files »    
     */
    sticker: { name: string, data: Buffer } | string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to get a sticker set. On success, a StickerSet object is
 * returned.
 */
export interface GetStickerSetParams
{

    /**
     * Name of the sticker set    
     */
    name: string,
}

/**
 * Use this method to upload a .png file with a sticker for later use in
 * createNewStickerSet and addStickerToSet methods (can be used multiple times).
 * Returns the uploaded File on success.
 */
export interface UploadStickerFileParams
{

    /**
     * User identifier of sticker file owner    
     */
    user_id: number,

    /**
     * Png image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. More info on
     * Sending Files »    
     */
    png_sticker: { name: string, data: Buffer },
}

/**
 * Use this method to create new sticker set owned by a user. The bot will be able
 * to edit the created sticker set. Returns True on success.
 */
export interface CreateNewStickerSetParams
{

    /**
     * User identifier of created sticker set owner    
     */
    user_id: number,

    /**
     * Short name of sticker set, to be used in t.me/addstickers/ URLs (e.g., animals).
     * Can contain only english letters, digits and underscores. Must begin with a
     * letter, can't contain consecutive underscores and must end in “_by_<bot
     * username>”. <bot_username> is case insensitive. 1-64 characters.    
     */
    name: string,

    /**
     * Sticker set title, 1-64 characters    
     */
    title: string,

    /**
     * Png image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. Pass a
     * file_id as a String to send a file that already exists on the Telegram servers,
     * pass an HTTP URL as a String for Telegram to get a file from the Internet, or
     * upload a new one using multipart/form-data. More info on Sending Files »    
     */
    png_sticker: { name: string, data: Buffer } | string,

    /**
     * One or more emoji corresponding to the sticker    
     */
    emojis: string,

    /**
     * Pass True, if a set of mask stickers should be created    
     */
    contains_masks?: boolean,

    /**
     * A JSON-serialized object for position where the mask should be placed on faces    
     */
    mask_position?: MaskPosition,
}

/**
 * Use this method to add a new sticker to a set created by the bot. Returns True
 * on success.
 */
export interface AddStickerToSetParams
{

    /**
     * User identifier of sticker set owner    
     */
    user_id: number,

    /**
     * Sticker set name    
     */
    name: string,

    /**
     * Png image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. Pass a
     * file_id as a String to send a file that already exists on the Telegram servers,
     * pass an HTTP URL as a String for Telegram to get a file from the Internet, or
     * upload a new one using multipart/form-data. More info on Sending Files »    
     */
    png_sticker: { name: string, data: Buffer } | string,

    /**
     * One or more emoji corresponding to the sticker    
     */
    emojis: string,

    /**
     * A JSON-serialized object for position where the mask should be placed on faces    
     */
    mask_position?: MaskPosition,
}

/**
 * Use this method to move a sticker in a set created by the bot to a specific
 * position . Returns True on success.
 */
export interface SetStickerPositionInSetParams
{

    /**
     * File identifier of the sticker    
     */
    sticker: string,

    /**
     * New sticker position in the set, zero-based    
     */
    position: number,
}

/**
 * Use this method to delete a sticker from a set created by the bot. Returns True
 * on success.
 */
export interface DeleteStickerFromSetParams
{

    /**
     * File identifier of the sticker    
     */
    sticker: string,
}

/**
 * This object represents an incoming inline query. When the user sends an empty
 * query, your bot could return some default or trending results.
 */
export interface InlineQuery
{

    /**
     * Unique identifier for this query    
     */
    id: string,

    /**
     * Sender    
     */
    from: User,

    /**
     * Optional. Sender location, only for bots that request user location    
     */
    location?: Location,

    /**
     * Text of the query (up to 512 characters)    
     */
    query: string,

    /**
     * Offset of the results to be returned, can be controlled by the bot    
     */
    offset: string,
}

/**
 * Use this method to send answers to an inline query. On success, True is
 * returned. No more than 50 results per query are allowed.
 */
export interface AnswerInlineQueryParams
{

    /**
     * Unique identifier for the answered query    
     */
    inline_query_id: string,

    /**
     * A JSON-serialized array of results for the inline query    
     */
    results: Array<InlineQueryResult>,

    /**
     * The maximum amount of time in seconds that the result of the inline query may be
     * cached on the server. Defaults to 300.    
     */
    cache_time?: number,

    /**
     * Pass True, if results may be cached on the server side only for the user that
     * sent the query. By default, results may be returned to any user who sends the
     * same query    
     */
    is_personal?: boolean,

    /**
     * Pass the offset that a client should send in the next query with the same text
     * to receive more results. Pass an empty string if there are no more results or if
     * you don‘t support pagination. Offset length can’t exceed 64 bytes.    
     */
    next_offset?: string,

    /**
     * If passed, clients will display a button with specified text that switches the
     * user to a private chat with the bot and sends the bot a start message with the
     * parameter switch_pm_parameter    
     */
    switch_pm_text?: string,

    /**
     * Deep-linking parameter for the /start message sent to the bot when user presses
     * the switch button. 1-64 characters, only A-Z, a-z, 0-9, _ and - are allowed.
     * Example: An inline bot that sends YouTube videos can ask the user to connect the
     * bot to their YouTube account to adapt search results accordingly. To do this, it
     * displays a ‘Connect your YouTube account’ button above the results, or even
     * before showing any. The user presses the button, switches to a private chat with
     * the bot and, in doing so, passes a start parameter that instructs the bot to
     * return an oauth link. Once done, the bot can offer a switch_inline button so
     * that the user can easily return to the chat where they wanted to use the bot's
     * inline capabilities.    
     */
    switch_pm_parameter?: string,
}

/**
 * Represents a link to an article or web page.
 */
export interface InlineQueryResultArticle extends InlineQueryResult
{

    /**
     * Type of the result, must be article    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 Bytes    
     */
    id: string,

    /**
     * Title of the result    
     */
    title: string,

    /**
     * Content of the message to be sent    
     */
    input_message_content: InputMessageContent,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. URL of the result    
     */
    url?: string,

    /**
     * Optional. Pass True, if you don't want the URL to be shown in the message    
     */
    hide_url?: boolean,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Url of the thumbnail for the result    
     */
    thumb_url?: string,

    /**
     * Optional. Thumbnail width    
     */
    thumb_width?: number,

    /**
     * Optional. Thumbnail height    
     */
    thumb_height?: number,
}

/**
 * Represents a link to a photo. By default, this photo will be sent by the user
 * with optional caption. Alternatively, you can use input_message_content to send
 * a message with the specified content instead of the photo.
 */
export interface InlineQueryResultPhoto extends InlineQueryResult
{

    /**
     * Type of the result, must be photo    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL of the photo. Photo must be in jpeg format. Photo size must not
     * exceed 5MB    
     */
    photo_url: string,

    /**
     * URL of the thumbnail for the photo    
     */
    thumb_url: string,

    /**
     * Optional. Width of the photo    
     */
    photo_width?: number,

    /**
     * Optional. Height of the photo    
     */
    photo_height?: number,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Caption of the photo to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the photo    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to an animated GIF file. By default, this animated GIF file
 * will be sent by the user with optional caption. Alternatively, you can use
 * input_message_content to send a message with the specified content instead of
 * the animation.
 */
export interface InlineQueryResultGif extends InlineQueryResult
{

    /**
     * Type of the result, must be gif    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL for the GIF file. File size must not exceed 1MB    
     */
    gif_url: string,

    /**
     * Optional. Width of the GIF    
     */
    gif_width?: number,

    /**
     * Optional. Height of the GIF    
     */
    gif_height?: number,

    /**
     * Optional. Duration of the GIF    
     */
    gif_duration?: number,

    /**
     * URL of the static thumbnail for the result (jpeg or gif)    
     */
    thumb_url: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the GIF file to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the GIF animation    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound).
 * By default, this animated MPEG-4 file will be sent by the user with optional
 * caption. Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the animation.
 */
export interface InlineQueryResultMpeg4Gif extends InlineQueryResult
{

    /**
     * Type of the result, must be mpeg4_gif    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL for the MP4 file. File size must not exceed 1MB    
     */
    mpeg4_url: string,

    /**
     * Optional. Video width    
     */
    mpeg4_width?: number,

    /**
     * Optional. Video height    
     */
    mpeg4_height?: number,

    /**
     * Optional. Video duration    
     */
    mpeg4_duration?: number,

    /**
     * URL of the static thumbnail (jpeg or gif) for the result    
     */
    thumb_url: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the MPEG-4 file to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the video animation    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a page containing an embedded video player or a video file.
 * By default, this video file will be sent by the user with an optional caption.
 * Alternatively, you can use input_message_content to send a message with the
 * specified content instead of the video.If an InlineQueryResultVideo message
 * contains an embedded video (e.g., YouTube), you must replace its content using
 * input_message_content. 
 */
export interface InlineQueryResultVideo extends InlineQueryResult
{

    /**
     * Type of the result, must be video    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL for the embedded video player or video file    
     */
    video_url: string,

    /**
     * Mime type of the content of video url, “text/html” or “video/mp4”    
     */
    mime_type: string,

    /**
     * URL of the thumbnail (jpeg only) for the video    
     */
    thumb_url: string,

    /**
     * Title for the result    
     */
    title: string,

    /**
     * Optional. Caption of the video to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Video width    
     */
    video_width?: number,

    /**
     * Optional. Video height    
     */
    video_height?: number,

    /**
     * Optional. Video duration in seconds    
     */
    video_duration?: number,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the video. This field is
     * required if InlineQueryResultVideo is used to send an HTML-page as a result
     * (e.g., a YouTube video).    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to an mp3 audio file. By default, this audio file will be sent
 * by the user. Alternatively, you can use input_message_content to send a message
 * with the specified content instead of the audio.
 */
export interface InlineQueryResultAudio extends InlineQueryResult
{

    /**
     * Type of the result, must be audio    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL for the audio file    
     */
    audio_url: string,

    /**
     * Title    
     */
    title: string,

    /**
     * Optional. Caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Performer    
     */
    performer?: string,

    /**
     * Optional. Audio duration in seconds    
     */
    audio_duration?: number,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the audio    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a voice recording in an .ogg container encoded with OPUS.
 * By default, this voice recording will be sent by the user. Alternatively, you
 * can use input_message_content to send a message with the specified content
 * instead of the the voice message.
 */
export interface InlineQueryResultVoice extends InlineQueryResult
{

    /**
     * Type of the result, must be voice    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid URL for the voice recording    
     */
    voice_url: string,

    /**
     * Recording title    
     */
    title: string,

    /**
     * Optional. Caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Recording duration in seconds    
     */
    voice_duration?: number,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the voice recording    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a file. By default, this file will be sent by the user with
 * an optional caption. Alternatively, you can use input_message_content to send a
 * message with the specified content instead of the file. Currently, only .PDF and
 * .ZIP files can be sent using this method.
 */
export interface InlineQueryResultDocument extends InlineQueryResult
{

    /**
     * Type of the result, must be document    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * Title for the result    
     */
    title: string,

    /**
     * Optional. Caption of the document to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * A valid URL for the file    
     */
    document_url: string,

    /**
     * Mime type of the content of the file, either “application/pdf” or
     * “application/zip”    
     */
    mime_type: string,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the file    
     */
    input_message_content?: InputMessageContent,

    /**
     * Optional. URL of the thumbnail (jpeg only) for the file    
     */
    thumb_url?: string,

    /**
     * Optional. Thumbnail width    
     */
    thumb_width?: number,

    /**
     * Optional. Thumbnail height    
     */
    thumb_height?: number,
}

/**
 * Represents a location on a map. By default, the location will be sent by the
 * user. Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the location.
 */
export interface InlineQueryResultLocation extends InlineQueryResult
{

    /**
     * Type of the result, must be location    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 Bytes    
     */
    id: string,

    /**
     * Location latitude in degrees    
     */
    latitude: any,

    /**
     * Location longitude in degrees    
     */
    longitude: any,

    /**
     * Location title    
     */
    title: string,

    /**
     * Optional. Period in seconds for which the location can be updated, should be
     * between 60 and 86400.    
     */
    live_period?: number,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the location    
     */
    input_message_content?: InputMessageContent,

    /**
     * Optional. Url of the thumbnail for the result    
     */
    thumb_url?: string,

    /**
     * Optional. Thumbnail width    
     */
    thumb_width?: number,

    /**
     * Optional. Thumbnail height    
     */
    thumb_height?: number,
}

/**
 * Represents a venue. By default, the venue will be sent by the user.
 * Alternatively, you can use input_message_content to send a message with the
 * specified content instead of the venue.
 */
export interface InlineQueryResultVenue extends InlineQueryResult
{

    /**
     * Type of the result, must be venue    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 Bytes    
     */
    id: string,

    /**
     * Latitude of the venue location in degrees    
     */
    latitude: number,

    /**
     * Longitude of the venue location in degrees    
     */
    longitude: number,

    /**
     * Title of the venue    
     */
    title: string,

    /**
     * Address of the venue    
     */
    address: string,

    /**
     * Optional. Foursquare identifier of the venue if known    
     */
    foursquare_id?: string,

    /**
     * Optional. Foursquare type of the venue, if known. (For example,
     * “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.)    
     */
    foursquare_type?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the venue    
     */
    input_message_content?: InputMessageContent,

    /**
     * Optional. Url of the thumbnail for the result    
     */
    thumb_url?: string,

    /**
     * Optional. Thumbnail width    
     */
    thumb_width?: number,

    /**
     * Optional. Thumbnail height    
     */
    thumb_height?: number,
}

/**
 * Represents a contact with a phone number. By default, this contact will be sent
 * by the user. Alternatively, you can use input_message_content to send a message
 * with the specified content instead of the contact.
 */
export interface InlineQueryResultContact extends InlineQueryResult
{

    /**
     * Type of the result, must be contact    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 Bytes    
     */
    id: string,

    /**
     * Contact's phone number    
     */
    phone_number: string,

    /**
     * Contact's first name    
     */
    first_name: string,

    /**
     * Optional. Contact's last name    
     */
    last_name?: string,

    /**
     * Optional. Additional data about the contact in the form of a vCard, 0-2048 bytes    
     */
    vcard?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the contact    
     */
    input_message_content?: InputMessageContent,

    /**
     * Optional. Url of the thumbnail for the result    
     */
    thumb_url?: string,

    /**
     * Optional. Thumbnail width    
     */
    thumb_width?: number,

    /**
     * Optional. Thumbnail height    
     */
    thumb_height?: number,
}

/**
 * Represents a Game.
 */
export interface InlineQueryResultGame extends InlineQueryResult
{

    /**
     * Type of the result, must be game    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * Short name of the game    
     */
    game_short_name: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Represents a link to a photo stored on the Telegram servers. By default, this
 * photo will be sent by the user with an optional caption. Alternatively, you can
 * use input_message_content to send a message with the specified content instead
 * of the photo.
 */
export interface InlineQueryResultCachedPhoto extends InlineQueryResult
{

    /**
     * Type of the result, must be photo    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier of the photo    
     */
    photo_file_id: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Caption of the photo to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the photo    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to an animated GIF file stored on the Telegram servers. By
 * default, this animated GIF file will be sent by the user with an optional
 * caption. Alternatively, you can use input_message_content to send a message with
 * specified content instead of the animation.
 */
export interface InlineQueryResultCachedGif extends InlineQueryResult
{

    /**
     * Type of the result, must be gif    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier for the GIF file    
     */
    gif_file_id: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the GIF file to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the GIF animation    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound)
 * stored on the Telegram servers. By default, this animated MPEG-4 file will be
 * sent by the user with an optional caption. Alternatively, you can use
 * input_message_content to send a message with the specified content instead of
 * the animation.
 */
export interface InlineQueryResultCachedMpeg4Gif extends InlineQueryResult
{

    /**
     * Type of the result, must be mpeg4_gif    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier for the MP4 file    
     */
    mpeg4_file_id: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the MPEG-4 file to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the video animation    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a sticker stored on the Telegram servers. By default, this
 * sticker will be sent by the user. Alternatively, you can use
 * input_message_content to send a message with the specified content instead of
 * the sticker.
 */
export interface InlineQueryResultCachedSticker extends InlineQueryResult
{

    /**
     * Type of the result, must be sticker    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier of the sticker    
     */
    sticker_file_id: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the sticker    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a file stored on the Telegram servers. By default, this
 * file will be sent by the user with an optional caption. Alternatively, you can
 * use input_message_content to send a message with the specified content instead
 * of the file.
 */
export interface InlineQueryResultCachedDocument extends InlineQueryResult
{

    /**
     * Type of the result, must be document    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * Title for the result    
     */
    title: string,

    /**
     * A valid file identifier for the file    
     */
    document_file_id: string,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Caption of the document to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the file    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a video file stored on the Telegram servers. By default,
 * this video file will be sent by the user with an optional caption.
 * Alternatively, you can use input_message_content to send a message with the
 * specified content instead of the video.
 */
export interface InlineQueryResultCachedVideo extends InlineQueryResult
{

    /**
     * Type of the result, must be video    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier for the video file    
     */
    video_file_id: string,

    /**
     * Title for the result    
     */
    title: string,

    /**
     * Optional. Short description of the result    
     */
    description?: string,

    /**
     * Optional. Caption of the video to be sent, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the video    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to a voice message stored on the Telegram servers. By default,
 * this voice message will be sent by the user. Alternatively, you can use
 * input_message_content to send a message with the specified content instead of
 * the voice message.
 */
export interface InlineQueryResultCachedVoice extends InlineQueryResult
{

    /**
     * Type of the result, must be voice    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier for the voice message    
     */
    voice_file_id: string,

    /**
     * Voice message title    
     */
    title: string,

    /**
     * Optional. Caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the voice message    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents a link to an mp3 audio file stored on the Telegram servers. By
 * default, this audio file will be sent by the user. Alternatively, you can use
 * input_message_content to send a message with the specified content instead of
 * the audio.
 */
export interface InlineQueryResultCachedAudio extends InlineQueryResult
{

    /**
     * Type of the result, must be audio    
     */
    type: string,

    /**
     * Unique identifier for this result, 1-64 bytes    
     */
    id: string,

    /**
     * A valid file identifier for the audio file    
     */
    audio_file_id: string,

    /**
     * Optional. Caption, 0-200 characters    
     */
    caption?: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in the media caption.    
     */
    parse_mode?: string,

    /**
     * Optional. Inline keyboard attached to the message    
     */
    reply_markup?: InlineKeyboardMarkup,

    /**
     * Optional. Content of the message to be sent instead of the audio    
     */
    input_message_content?: InputMessageContent,
}

/**
 * Represents the content of a text message to be sent as the result of an inline
 * query.
 */
export interface InputTextMessageContent extends InputMessageContent
{

    /**
     * Text of the message to be sent, 1-4096 characters    
     */
    message_text: string,

    /**
     * Optional. Send Markdown or HTML, if you want Telegram apps to show bold, italic,
     * fixed-width text or inline URLs in your bot's message.    
     */
    parse_mode?: string,

    /**
     * Optional. Disables link previews for links in the sent message    
     */
    disable_web_page_preview?: boolean,
}

/**
 * Represents the content of a location message to be sent as the result of an
 * inline query.
 */
export interface InputLocationMessageContent extends InputMessageContent
{

    /**
     * Latitude of the location in degrees    
     */
    latitude: number,

    /**
     * Longitude of the location in degrees    
     */
    longitude: number,

    /**
     * Optional. Period in seconds for which the location can be updated, should be
     * between 60 and 86400.    
     */
    live_period?: number,
}

/**
 * Represents the content of a venue message to be sent as the result of an inline
 * query.
 */
export interface InputVenueMessageContent extends InputMessageContent
{

    /**
     * Latitude of the venue in degrees    
     */
    latitude: number,

    /**
     * Longitude of the venue in degrees    
     */
    longitude: number,

    /**
     * Name of the venue    
     */
    title: string,

    /**
     * Address of the venue    
     */
    address: string,

    /**
     * Optional. Foursquare identifier of the venue, if known    
     */
    foursquare_id?: string,

    /**
     * Optional. Foursquare type of the venue, if known. (For example,
     * “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.)    
     */
    foursquare_type?: string,
}

/**
 * Represents the content of a contact message to be sent as the result of an
 * inline query.
 */
export interface InputContactMessageContent extends InputMessageContent
{

    /**
     * Contact's phone number    
     */
    phone_number: string,

    /**
     * Contact's first name    
     */
    first_name: string,

    /**
     * Optional. Contact's last name    
     */
    last_name?: string,

    /**
     * Optional. Additional data about the contact in the form of a vCard, 0-2048 bytes    
     */
    vcard?: string,
}

/**
 * Represents a result of an inline query that was chosen by the user and sent to
 * their chat partner.
 */
export interface ChosenInlineResult
{

    /**
     * The unique identifier for the result that was chosen    
     */
    result_id: string,

    /**
     * The user that chose the result    
     */
    from: User,

    /**
     * Optional. Sender location, only for bots that require user location    
     */
    location?: Location,

    /**
     * Optional. Identifier of the sent inline message. Available only if there is an
     * inline keyboard attached to the message. Will be also received in callback
     * queries and can be used to edit the message.    
     */
    inline_message_id?: string,

    /**
     * The query that was used to obtain the result    
     */
    query: string,
}

/**
 * Use this method to send invoices. On success, the sent Message is returned.
 */
export interface SendInvoiceParams
{

    /**
     * Unique identifier for the target private chat    
     */
    chat_id: number,

    /**
     * Product name, 1-32 characters    
     */
    title: string,

    /**
     * Product description, 1-255 characters    
     */
    description: string,

    /**
     * Bot-defined invoice payload, 1-128 bytes. This will not be displayed to the
     * user, use for your internal processes.    
     */
    payload: string,

    /**
     * Payments provider token, obtained via Botfather    
     */
    provider_token: string,

    /**
     * Unique deep-linking parameter that can be used to generate this invoice when
     * used as a start parameter    
     */
    start_parameter: string,

    /**
     * Three-letter ISO 4217 currency code, see more on currencies    
     */
    currency: string,

    /**
     * Price breakdown, a list of components (e.g. product price, tax, discount,
     * delivery cost, delivery tax, bonus, etc.)    
     */
    prices: Array<LabeledPrice>,

    /**
     * JSON-encoded data about the invoice, which will be shared with the payment
     * provider. A detailed description of required fields should be provided by the
     * payment provider.    
     */
    provider_data?: string,

    /**
     * URL of the product photo for the invoice. Can be a photo of the goods or a
     * marketing image for a service. People like it better when they see what they are
     * paying for.    
     */
    photo_url?: string,

    /**
     * Photo size    
     */
    photo_size?: number,

    /**
     * Photo width    
     */
    photo_width?: number,

    /**
     * Photo height    
     */
    photo_height?: number,

    /**
     * Pass True, if you require the user's full name to complete the order    
     */
    need_name?: boolean,

    /**
     * Pass True, if you require the user's phone number to complete the order    
     */
    need_phone_number?: boolean,

    /**
     * Pass True, if you require the user's email address to complete the order    
     */
    need_email?: boolean,

    /**
     * Pass True, if you require the user's shipping address to complete the order    
     */
    need_shipping_address?: boolean,

    /**
     * Pass True, if user's phone number should be sent to provider    
     */
    send_phone_number_to_provider?: boolean,

    /**
     * Pass True, if user's email address should be sent to provider    
     */
    send_email_to_provider?: boolean,

    /**
     * Pass True, if the final price depends on the shipping method    
     */
    is_flexible?: boolean,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * A JSON-serialized object for an inline keyboard. If empty, one 'Pay total price'
     * button will be shown. If not empty, the first button must be a Pay button.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * If you sent an invoice requesting a shipping address and the parameter
 * is_flexible was specified, the Bot API will send an Update with a shipping_query
 * field to the bot. Use this method to reply to shipping queries. On success, True
 * is returned.
 */
export interface AnswerShippingQueryParams
{

    /**
     * Unique identifier for the query to be answered    
     */
    shipping_query_id: string,

    /**
     * Specify True if delivery to the specified address is possible and False if there
     * are any problems (for example, if delivery to the specified address is not
     * possible)    
     */
    ok: boolean,

    /**
     * Required if ok is True. A JSON-serialized array of available shipping options.    
     */
    shipping_options?: Array<ShippingOption>,

    /**
     * Required if ok is False. Error message in human readable form that explains why
     * it is impossible to complete the order (e.g. "Sorry, delivery to your desired
     * address is unavailable'). Telegram will display this message to the user.    
     */
    error_message?: string,
}

/**
 * Once the user has confirmed their payment and shipping details, the Bot API
 * sends the final confirmation in the form of an Update with the field
 * pre_checkout_query. Use this method to respond to such pre-checkout queries. On
 * success, True is returned. Note: The Bot API must receive an answer within 10
 * seconds after the pre-checkout query was sent.
 */
export interface AnswerPreCheckoutQueryParams
{

    /**
     * Unique identifier for the query to be answered    
     */
    pre_checkout_query_id: string,

    /**
     * Specify True if everything is alright (goods are available, etc.) and the bot is
     * ready to proceed with the order. Use False if there are any problems.    
     */
    ok: boolean,

    /**
     * Required if ok is False. Error message in human readable form that explains the
     * reason for failure to proceed with the checkout (e.g. "Sorry, somebody just
     * bought the last of our amazing black T-shirts while you were busy filling out
     * your payment details. Please choose a different color or garment!"). Telegram
     * will display this message to the user.    
     */
    error_message?: string,
}

/**
 * This object represents a portion of the price for goods or services.
 */
export interface LabeledPrice
{

    /**
     * Portion label    
     */
    label: string,

    /**
     * Price of the product in the smallest units of the currency (integer, not
     * float/double). For example, for a price of US$ 1.45 pass amount = 145. See the
     * exp parameter in currencies.json, it shows the number of digits past the decimal
     * point for each currency (2 for the majority of currencies).    
     */
    amount: number,
}

/**
 * This object contains basic information about an invoice.
 */
export interface Invoice
{

    /**
     * Product name    
     */
    title: string,

    /**
     * Product description    
     */
    description: string,

    /**
     * Unique bot deep-linking parameter that can be used to generate this invoice    
     */
    start_parameter: string,

    /**
     * Three-letter ISO 4217 currency code    
     */
    currency: string,

    /**
     * Total price in the smallest units of the currency (integer, not float/double).
     * For example, for a price of US$ 1.45 pass amount = 145. See the exp parameter in
     * currencies.json, it shows the number of digits past the decimal point for each
     * currency (2 for the majority of currencies).    
     */
    total_amount: number,
}

/**
 * This object represents a shipping address.
 */
export interface ShippingAddress
{

    /**
     * ISO 3166-1 alpha-2 country code    
     */
    country_code: string,

    /**
     * State, if applicable    
     */
    state: string,

    /**
     * City    
     */
    city: string,

    /**
     * First line for the address    
     */
    street_line1: string,

    /**
     * Second line for the address    
     */
    street_line2: string,

    /**
     * Address post code    
     */
    post_code: string,
}

/**
 * This object represents information about an order.
 */
export interface OrderInfo
{

    /**
     * Optional. User name    
     */
    name?: string,

    /**
     * Optional. User's phone number    
     */
    phone_number?: string,

    /**
     * Optional. User email    
     */
    email?: string,

    /**
     * Optional. User shipping address    
     */
    shipping_address?: ShippingAddress,
}

/**
 * This object represents one shipping option.
 */
export interface ShippingOption
{

    /**
     * Shipping option identifier    
     */
    id: string,

    /**
     * Option title    
     */
    title: string,

    /**
     * List of price portions    
     */
    prices: Array<LabeledPrice>,
}

/**
 * This object contains basic information about a successful payment.
 */
export interface SuccessfulPayment
{

    /**
     * Three-letter ISO 4217 currency code    
     */
    currency: string,

    /**
     * Total price in the smallest units of the currency (integer, not float/double).
     * For example, for a price of US$ 1.45 pass amount = 145. See the exp parameter in
     * currencies.json, it shows the number of digits past the decimal point for each
     * currency (2 for the majority of currencies).    
     */
    total_amount: number,

    /**
     * Bot specified invoice payload    
     */
    invoice_payload: string,

    /**
     * Optional. Identifier of the shipping option chosen by the user    
     */
    shipping_option_id?: string,

    /**
     * Optional. Order info provided by the user    
     */
    order_info?: OrderInfo,

    /**
     * Telegram payment identifier    
     */
    telegram_payment_charge_id: string,

    /**
     * Provider payment identifier    
     */
    provider_payment_charge_id: string,
}

/**
 * This object contains information about an incoming shipping query.
 */
export interface ShippingQuery
{

    /**
     * Unique query identifier    
     */
    id: string,

    /**
     * User who sent the query    
     */
    from: User,

    /**
     * Bot specified invoice payload    
     */
    invoice_payload: string,

    /**
     * User specified shipping address    
     */
    shipping_address: ShippingAddress,
}

/**
 * This object contains information about an incoming pre-checkout query.
 */
export interface PreCheckoutQuery
{

    /**
     * Unique query identifier    
     */
    id: string,

    /**
     * User who sent the query    
     */
    from: User,

    /**
     * Three-letter ISO 4217 currency code    
     */
    currency: string,

    /**
     * Total price in the smallest units of the currency (integer, not float/double).
     * For example, for a price of US$ 1.45 pass amount = 145. See the exp parameter in
     * currencies.json, it shows the number of digits past the decimal point for each
     * currency (2 for the majority of currencies).    
     */
    total_amount: number,

    /**
     * Bot specified invoice payload    
     */
    invoice_payload: string,

    /**
     * Optional. Identifier of the shipping option chosen by the user    
     */
    shipping_option_id?: string,

    /**
     * Optional. Order info provided by the user    
     */
    order_info?: OrderInfo,
}

/**
 * Contains information about Telegram Passport data shared with the bot by the
 * user.
 */
export interface PassportData
{

    /**
     * Array with information about documents and other Telegram Passport elements that
     * was shared with the bot    
     */
    data: Array<EncryptedPassportElement>,

    /**
     * Encrypted credentials required to decrypt the data    
     */
    credentials: EncryptedCredentials,
}

/**
 * This object represents a file uploaded to Telegram Passport. Currently all
 * Telegram Passport files are in JPEG format when decrypted and don't exceed 10MB.
 */
export interface PassportFile
{

    /**
     * Unique identifier for this file    
     */
    file_id: string,

    /**
     * File size    
     */
    file_size: number,

    /**
     * Unix time when the file was uploaded    
     */
    file_date: number,
}

/**
 * Contains information about documents or other Telegram Passport elements shared
 * with the bot by the user.
 */
export interface EncryptedPassportElement
{

    /**
     * Element type. One of “personal_details”, “passport”, “driver_license”,
     * “identity_card”, “internal_passport”, “address”, “utility_bill”,
     * “bank_statement”, “rental_agreement”, “passport_registration”,
     * “temporary_registration”, “phone_number”, “email”.    
     */
    type: string,

    /**
     * Optional. Base64-encoded encrypted Telegram Passport element data provided by
     * the user, available for “personal_details”, “passport”, “driver_license”,
     * “identity_card”, “internal_passport” and “address” types. Can be decrypted and
     * verified using the accompanying EncryptedCredentials.    
     */
    data?: string,

    /**
     * Optional. User's verified phone number, available only for “phone_number” type    
     */
    phone_number?: string,

    /**
     * Optional. User's verified email address, available only for “email” type    
     */
    email?: string,

    /**
     * Optional. Array of encrypted files with documents provided by the user,
     * available for “utility_bill”, “bank_statement”, “rental_agreement”,
     * “passport_registration” and “temporary_registration” types. Files can be
     * decrypted and verified using the accompanying EncryptedCredentials.    
     */
    files?: Array<PassportFile>,

    /**
     * Optional. Encrypted file with the front side of the document, provided by the
     * user. Available for “passport”, “driver_license”, “identity_card” and
     * “internal_passport”. The file can be decrypted and verified using the
     * accompanying EncryptedCredentials.    
     */
    front_side?: PassportFile,

    /**
     * Optional. Encrypted file with the reverse side of the document, provided by the
     * user. Available for “driver_license” and “identity_card”. The file can be
     * decrypted and verified using the accompanying EncryptedCredentials.    
     */
    reverse_side?: PassportFile,

    /**
     * Optional. Encrypted file with the selfie of the user holding a document,
     * provided by the user; available for “passport”, “driver_license”,
     * “identity_card” and “internal_passport”. The file can be decrypted and verified
     * using the accompanying EncryptedCredentials.    
     */
    selfie?: PassportFile,

    /**
     * Optional. Array of encrypted files with translated versions of documents
     * provided by the user. Available if requested for “passport”, “driver_license”,
     * “identity_card”, “internal_passport”, “utility_bill”, “bank_statement”,
     * “rental_agreement”, “passport_registration” and “temporary_registration” types.
     * Files can be decrypted and verified using the accompanying EncryptedCredentials.    
     */
    translation?: Array<PassportFile>,

    /**
     * Base64-encoded element hash for using in PassportElementErrorUnspecified    
     */
    hash: string,
}

/**
 * Contains data required for decrypting and authenticating
 * EncryptedPassportElement. See the Telegram Passport Documentation for a complete
 * description of the data decryption and authentication processes.
 */
export interface EncryptedCredentials
{

    /**
     * Base64-encoded encrypted JSON-serialized data with unique user's payload, data
     * hashes and secrets required for EncryptedPassportElement decryption and
     * authentication    
     */
    data: string,

    /**
     * Base64-encoded data hash for data authentication    
     */
    hash: string,

    /**
     * Base64-encoded secret, encrypted with the bot's public RSA key, required for
     * data decryption    
     */
    secret: string,
}

/**
 * Informs a user that some of the Telegram Passport elements they provided
 * contains errors. The user will not be able to re-submit their Passport to you
 * until the errors are fixed (the contents of the field for which you returned the
 * error must change). Returns True on success.Use this if the data submitted by
 * the user doesn't satisfy the standards your service requires for any reason. For
 * example, if a birthday date seems invalid, a submitted document is blurry, a
 * scan shows evidence of tampering, etc. Supply some details in the error message
 * to make sure the user knows how to correct the issues.
 */
export interface SetPassportDataErrorsParams
{

    /**
     * User identifier    
     */
    user_id: number,

    /**
     * A JSON-serialized array describing the errors    
     */
    errors: Array<PassportElementError>,
}

/**
 * Represents an issue in one of the data fields that was provided by the user. The
 * error is considered resolved when the field's value changes.
 */
export interface PassportElementErrorDataField extends PassportElementError
{

    /**
     * Error source, must be data    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the error, one of
     * “personal_details”, “passport”, “driver_license”, “identity_card”,
     * “internal_passport”, “address”    
     */
    type: string,

    /**
     * Name of the data field which has the error    
     */
    field_name: string,

    /**
     * Base64-encoded data hash    
     */
    data_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with the front side of a document. The error is considered
 * resolved when the file with the front side of the document changes.
 */
export interface PassportElementErrorFrontSide extends PassportElementError
{

    /**
     * Error source, must be front_side    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the issue, one of
     * “passport”, “driver_license”, “identity_card”, “internal_passport”    
     */
    type: string,

    /**
     * Base64-encoded hash of the file with the front side of the document    
     */
    file_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with the reverse side of a document. The error is considered
 * resolved when the file with reverse side of the document changes.
 */
export interface PassportElementErrorReverseSide extends PassportElementError
{

    /**
     * Error source, must be reverse_side    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the issue, one of
     * “driver_license”, “identity_card”    
     */
    type: string,

    /**
     * Base64-encoded hash of the file with the reverse side of the document    
     */
    file_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with the selfie with a document. The error is considered
 * resolved when the file with the selfie changes.
 */
export interface PassportElementErrorSelfie extends PassportElementError
{

    /**
     * Error source, must be selfie    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the issue, one of
     * “passport”, “driver_license”, “identity_card”, “internal_passport”    
     */
    type: string,

    /**
     * Base64-encoded hash of the file with the selfie    
     */
    file_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with a document scan. The error is considered resolved when
 * the file with the document scan changes.
 */
export interface PassportElementErrorFile extends PassportElementError
{

    /**
     * Error source, must be file    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the issue, one of
     * “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”,
     * “temporary_registration”    
     */
    type: string,

    /**
     * Base64-encoded file hash    
     */
    file_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with a list of scans. The error is considered resolved when
 * the list of files containing the scans changes.
 */
export interface PassportElementErrorFiles extends PassportElementError
{

    /**
     * Error source, must be files    
     */
    source: string,

    /**
     * The section of the user's Telegram Passport which has the issue, one of
     * “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”,
     * “temporary_registration”    
     */
    type: string,

    /**
     * List of base64-encoded file hashes    
     */
    file_hashes: Array<string>,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with one of the files that constitute the translation of a
 * document. The error is considered resolved when the file changes.
 */
export interface PassportElementErrorTranslationFile extends PassportElementError
{

    /**
     * Error source, must be translation_file    
     */
    source: string,

    /**
     * Type of element of the user's Telegram Passport which has the issue, one of
     * “passport”, “driver_license”, “identity_card”, “internal_passport”,
     * “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”,
     * “temporary_registration”    
     */
    type: string,

    /**
     * Base64-encoded file hash    
     */
    file_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue with the translated version of a document. The error is
 * considered resolved when a file with the document translation change.
 */
export interface PassportElementErrorTranslationFiles extends PassportElementError
{

    /**
     * Error source, must be translation_files    
     */
    source: string,

    /**
     * Type of element of the user's Telegram Passport which has the issue, one of
     * “passport”, “driver_license”, “identity_card”, “internal_passport”,
     * “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”,
     * “temporary_registration”    
     */
    type: string,

    /**
     * List of base64-encoded file hashes    
     */
    file_hashes: Array<string>,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Represents an issue in an unspecified place. The error is considered resolved
 * when new data is added.
 */
export interface PassportElementErrorUnspecified extends PassportElementError
{

    /**
     * Error source, must be unspecified    
     */
    source: string,

    /**
     * Type of element of the user's Telegram Passport which has the issue    
     */
    type: string,

    /**
     * Base64-encoded element hash    
     */
    element_hash: string,

    /**
     * Error message    
     */
    message: string,
}

/**
 * Use this method to send a game. On success, the sent Message is returned.
 */
export interface SendGameParams
{

    /**
     * Unique identifier for the target chat    
     */
    chat_id: number,

    /**
     * Short name of the game, serves as the unique identifier for the game. Set up
     * your games via Botfather.    
     */
    game_short_name: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * A JSON-serialized object for an inline keyboard. If empty, one ‘Play game_title’
     * button will be shown. If not empty, the first button must launch the game.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * This object represents a game. Use BotFather to create and edit games, their
 * short names will act as unique identifiers.
 */
export interface Game
{

    /**
     * Title of the game    
     */
    title: string,

    /**
     * Description of the game    
     */
    description: string,

    /**
     * Photo that will be displayed in the game message in chats.    
     */
    photo: Array<PhotoSize>,

    /**
     * Optional. Brief description of the game or high scores included in the game
     * message. Can be automatically edited to include current high scores for the game
     * when the bot calls setGameScore, or manually edited using editMessageText.
     * 0-4096 characters.    
     */
    text?: string,

    /**
     * Optional. Special entities that appear in text, such as usernames, URLs, bot
     * commands, etc.    
     */
    text_entities?: Array<MessageEntity>,

    /**
     * Optional. Animation that will be displayed in the game message in chats. Upload
     * via BotFather    
     */
    animation?: Animation,
}

/**
 * Use this method to set the score of the specified user in a game. On success, if
 * the message was sent by the bot, returns the edited Message, otherwise returns
 * True. Returns an error, if the new score is not greater than the user's current
 * score in the chat and force is False.
 */
export interface SetGameScoreParams
{

    /**
     * User identifier    
     */
    user_id: number,

    /**
     * New score, must be non-negative    
     */
    score: number,

    /**
     * Pass True, if the high score is allowed to decrease. This can be useful when
     * fixing mistakes or banning cheaters    
     */
    force?: boolean,

    /**
     * Pass True, if the game message should not be automatically edited to include the
     * current scoreboard    
     */
    disable_edit_message?: boolean,

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat    
     */
    chat_id?: number,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,
}

/**
 * Use this method to get data for high score tables. Will return the score of the
 * specified user and several of his neighbors in a game. On success, returns an
 * Array of GameHighScore objects.This method will currently return scores for the
 * target user, plus two of his closest neighbors on each side. Will also return
 * the top three users if the user and his neighbors are not among them. Please
 * note that this behavior is subject to change. 
 */
export interface GetGameHighScoresParams
{

    /**
     * Target user id    
     */
    user_id: number,

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat    
     */
    chat_id?: number,

    /**
     * Required if inline_message_id is not specified. Identifier of the sent message    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,
}

/**
 * This object represents one row of the high scores table for a game.
 */
export interface GameHighScore
{

    /**
     * Position in high score table for the game    
     */
    position: number,

    /**
     * User    
     */
    user: User,

    /**
     * Score    
     */
    score: number,
}

/**
 * This object represents the content of a media message to be sent.
 */
export interface InputMedia
{

}

/**
 * This object represents the content of a message to be sent as a result of an
 * inline query.
 */
export interface InputMessageContent
{

}

/**
 * This object represents one result of an inline query.
 */
export interface InlineQueryResult
{

}

/**
 * This object represents an error in the Telegram Passport element which was
 * submitted that should be resolved by the user.
 */
export interface PassportElementError
{

}
