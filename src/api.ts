
import * as Https  from 'https';

/**
 * All official methods of the Telegram Bot API without abstraction.
 */
export class TelegramBotRaw
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
     * https://www.example.com/<token>. Since nobody else knows your bot's token, you
     * can be pretty sure it's us.    
     */
    public async setWebhook (params: SetWebhookParams): Promise<boolean>
    {
        return this.request ('setWebhook', params);
    }

    /**
     * Use this method to remove webhook integration if you decide to switch back to
     * getUpdates. Returns True on success.    
     */
    public async deleteWebhook (params: DeleteWebhookParams): Promise<boolean>
    {
        return this.request ('deleteWebhook', params);
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
     * A simple method for testing your bot's authentication token. Requires no
     * parameters. Returns basic information about the bot in form of a User object.    
     */
    public async getMe (): Promise<User>
    {
        return this.request ('getMe', {});
    }

    /**
     * Use this method to log out from the cloud Bot API server before launching the
     * bot locally. You must log out the bot before running it locally, otherwise there
     * is no guarantee that the bot will receive updates. After a successful call, you
     * can immediately log in on a local server, but will not be able to log in back to
     * the cloud Bot API server for 10 minutes. Returns True on success. Requires no
     * parameters.    
     */
    public async logOut (): Promise<boolean>
    {
        return this.request ('logOut', {});
    }

    /**
     * Use this method to close the bot instance before moving it from one local server
     * to another. You need to delete the webhook before calling this method to ensure
     * that the bot isn't launched again after server restart. The method will return
     * error 429 in the first 10 minutes after the bot is launched. Returns True on
     * success. Requires no parameters.    
     */
    public async close (): Promise<boolean>
    {
        return this.request ('close', {});
    }

    /**
     * Use this method to send text messages. On success, the sent Message is returned.    
     */
    public async sendMessage (params: SendMessageParams): Promise<Message>
    {
        return this.request ('sendMessage', params);
    }

    /**
     * Use this method to forward messages of any kind. Service messages can't be
     * forwarded. On success, the sent Message is returned.    
     */
    public async forwardMessage (params: ForwardMessageParams): Promise<Message>
    {
        return this.request ('forwardMessage', params);
    }

    /**
     * Use this method to copy messages of any kind. Service messages and invoice
     * messages can't be copied. The method is analogous to the method forwardMessage,
     * but the copied message doesn't have a link to the original message. Returns the
     * MessageId of the sent message on success.    
     */
    public async copyMessage (params: CopyMessageParams): Promise<MessageId>
    {
        return this.request ('copyMessage', params);
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
     * them in the music player. Your audio must be in the .MP3 or .M4A format. On
     * success, the sent Message is returned. Bots can currently send audio files of up
     * to 50 MB in size, this limit may be changed in the future.For sending voice
     * messages, use the sendVoice method instead.    
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
     * .OGG file encoded with OPUS (other formats may be sent as Audio or Document). On
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
     * Use this method to send a group of photos, videos, documents or audios as an
     * album. Documents and audio files can be only grouped in an album with messages
     * of the same type. On success, an array of Messages that were sent is returned.    
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
     * Use this method to edit live location messages. A location can be edited until
     * its live_period expires or editing is explicitly disabled by a call to
     * stopMessageLiveLocation. On success, if the edited message is not an inline
     * message, the edited Message is returned, otherwise True is returned.    
     */
    public async editMessageLiveLocation (params: EditMessageLiveLocationParams): Promise<Message | boolean>
    {
        return this.request ('editMessageLiveLocation', params);
    }

    /**
     * Use this method to stop updating a live location message before live_period
     * expires. On success, if the message is not an inline message, the edited Message
     * is returned, otherwise True is returned.    
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
     * Use this method to send a native poll. On success, the sent Message is returned.    
     */
    public async sendPoll (params: SendPollParams): Promise<Message>
    {
        return this.request ('sendPoll', params);
    }

    /**
     * Use this method to send an animated emoji that will display a random value. On
     * success, the sent Message is returned.    
     */
    public async sendDice (params: SendDiceParams): Promise<Message>
    {
        return this.request ('sendDice', params);
    }

    /**
     * Use this method when you need to tell the user that something is happening on
     * the bot's side. The status is set for 5 seconds or less (when a message arrives
     * from your bot, Telegram clients clear its typing status). Returns True on
     * success.Example: The ImageBot needs some time to process a request and upload
     * the image. Instead of sending a text message along the lines of “Retrieving
     * image, please wait…”, the bot may use sendChatAction with action = upload_photo.
     * The user will see a “sending photo” status for the bot.We only recommend using
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
     * Use this method to ban a user in a group, a supergroup or a channel. In the case
     * of supergroups and channels, the user will not be able to return to the chat on
     * their own using invite links, etc., unless unbanned first. The bot must be an
     * administrator in the chat for this to work and must have the appropriate
     * administrator rights. Returns True on success.    
     */
    public async banChatMember (params: BanChatMemberParams): Promise<boolean>
    {
        return this.request ('banChatMember', params);
    }

    /**
     * Use this method to unban a previously banned user in a supergroup or channel.
     * The user will not return to the group or channel automatically, but will be able
     * to join via link, etc. The bot must be an administrator for this to work. By
     * default, this method guarantees that after the call the user is not a member of
     * the chat, but will be able to join it. So if the user is a member of the chat
     * they will also be removed from the chat. If you don't want this, use the
     * parameter only_if_banned. Returns True on success.    
     */
    public async unbanChatMember (params: UnbanChatMemberParams): Promise<boolean>
    {
        return this.request ('unbanChatMember', params);
    }

    /**
     * Use this method to restrict a user in a supergroup. The bot must be an
     * administrator in the supergroup for this to work and must have the appropriate
     * administrator rights. Pass True for all permissions to lift restrictions from a
     * user. Returns True on success.    
     */
    public async restrictChatMember (params: RestrictChatMemberParams): Promise<boolean>
    {
        return this.request ('restrictChatMember', params);
    }

    /**
     * Use this method to promote or demote a user in a supergroup or a channel. The
     * bot must be an administrator in the chat for this to work and must have the
     * appropriate administrator rights. Pass False for all boolean parameters to
     * demote a user. Returns True on success.    
     */
    public async promoteChatMember (params: PromoteChatMemberParams): Promise<boolean>
    {
        return this.request ('promoteChatMember', params);
    }

    /**
     * Use this method to set a custom title for an administrator in a supergroup
     * promoted by the bot. Returns True on success.    
     */
    public async setChatAdministratorCustomTitle (params: SetChatAdministratorCustomTitleParams): Promise<boolean>
    {
        return this.request ('setChatAdministratorCustomTitle', params);
    }

    /**
     * Use this method to ban a channel chat in a supergroup or a channel. Until the
     * chat is unbanned, the owner of the banned chat won't be able to send messages on
     * behalf of any of their channels. The bot must be an administrator in the
     * supergroup or channel for this to work and must have the appropriate
     * administrator rights. Returns True on success.    
     */
    public async banChatSenderChat (params: BanChatSenderChatParams): Promise<boolean>
    {
        return this.request ('banChatSenderChat', params);
    }

    /**
     * Use this method to unban a previously banned channel chat in a supergroup or
     * channel. The bot must be an administrator for this to work and must have the
     * appropriate administrator rights. Returns True on success.    
     */
    public async unbanChatSenderChat (params: UnbanChatSenderChatParams): Promise<boolean>
    {
        return this.request ('unbanChatSenderChat', params);
    }

    /**
     * Use this method to set default chat permissions for all members. The bot must be
     * an administrator in the group or a supergroup for this to work and must have the
     * can_restrict_members administrator rights. Returns True on success.    
     */
    public async setChatPermissions (params: SetChatPermissionsParams): Promise<boolean>
    {
        return this.request ('setChatPermissions', params);
    }

    /**
     * Use this method to generate a new primary invite link for a chat; any previously
     * generated primary link is revoked. The bot must be an administrator in the chat
     * for this to work and must have the appropriate administrator rights. Returns the
     * new invite link as String on success.    
     */
    public async exportChatInviteLink (params: ExportChatInviteLinkParams): Promise<string>
    {
        return this.request ('exportChatInviteLink', params);
    }

    /**
     * Use this method to create an additional invite link for a chat. The bot must be
     * an administrator in the chat for this to work and must have the appropriate
     * administrator rights. The link can be revoked using the method
     * revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.    
     */
    public async createChatInviteLink (params: CreateChatInviteLinkParams): Promise<ChatInviteLink>
    {
        return this.request ('createChatInviteLink', params);
    }

    /**
     * Use this method to edit a non-primary invite link created by the bot. The bot
     * must be an administrator in the chat for this to work and must have the
     * appropriate administrator rights. Returns the edited invite link as a
     * ChatInviteLink object.    
     */
    public async editChatInviteLink (params: EditChatInviteLinkParams): Promise<ChatInviteLink>
    {
        return this.request ('editChatInviteLink', params);
    }

    /**
     * Use this method to revoke an invite link created by the bot. If the primary link
     * is revoked, a new link is automatically generated. The bot must be an
     * administrator in the chat for this to work and must have the appropriate
     * administrator rights. Returns the revoked invite link as ChatInviteLink object.    
     */
    public async revokeChatInviteLink (params: RevokeChatInviteLinkParams): Promise<ChatInviteLink>
    {
        return this.request ('revokeChatInviteLink', params);
    }

    /**
     * Use this method to approve a chat join request. The bot must be an administrator
     * in the chat for this to work and must have the can_invite_users administrator
     * right. Returns True on success.    
     */
    public async approveChatJoinRequest (params: ApproveChatJoinRequestParams): Promise<boolean>
    {
        return this.request ('approveChatJoinRequest', params);
    }

    /**
     * Use this method to decline a chat join request. The bot must be an administrator
     * in the chat for this to work and must have the can_invite_users administrator
     * right. Returns True on success.    
     */
    public async declineChatJoinRequest (params: DeclineChatJoinRequestParams): Promise<boolean>
    {
        return this.request ('declineChatJoinRequest', params);
    }

    /**
     * Use this method to set a new profile photo for the chat. Photos can't be changed
     * for private chats. The bot must be an administrator in the chat for this to work
     * and must have the appropriate administrator rights. Returns True on success.    
     */
    public async setChatPhoto (params: SetChatPhotoParams): Promise<boolean>
    {
        return this.request ('setChatPhoto', params);
    }

    /**
     * Use this method to delete a chat photo. Photos can't be changed for private
     * chats. The bot must be an administrator in the chat for this to work and must
     * have the appropriate administrator rights. Returns True on success.    
     */
    public async deleteChatPhoto (params: DeleteChatPhotoParams): Promise<boolean>
    {
        return this.request ('deleteChatPhoto', params);
    }

    /**
     * Use this method to change the title of a chat. Titles can't be changed for
     * private chats. The bot must be an administrator in the chat for this to work and
     * must have the appropriate administrator rights. Returns True on success.    
     */
    public async setChatTitle (params: SetChatTitleParams): Promise<boolean>
    {
        return this.request ('setChatTitle', params);
    }

    /**
     * Use this method to change the description of a group, a supergroup or a channel.
     * The bot must be an administrator in the chat for this to work and must have the
     * appropriate administrator rights. Returns True on success.    
     */
    public async setChatDescription (params: SetChatDescriptionParams): Promise<boolean>
    {
        return this.request ('setChatDescription', params);
    }

    /**
     * Use this method to add a message to the list of pinned messages in a chat. If
     * the chat is not a private chat, the bot must be an administrator in the chat for
     * this to work and must have the 'can_pin_messages' administrator right in a
     * supergroup or 'can_edit_messages' administrator right in a channel. Returns True
     * on success.    
     */
    public async pinChatMessage (params: PinChatMessageParams): Promise<boolean>
    {
        return this.request ('pinChatMessage', params);
    }

    /**
     * Use this method to remove a message from the list of pinned messages in a chat.
     * If the chat is not a private chat, the bot must be an administrator in the chat
     * for this to work and must have the 'can_pin_messages' administrator right in a
     * supergroup or 'can_edit_messages' administrator right in a channel. Returns True
     * on success.    
     */
    public async unpinChatMessage (params: UnpinChatMessageParams): Promise<boolean>
    {
        return this.request ('unpinChatMessage', params);
    }

    /**
     * Use this method to clear the list of pinned messages in a chat. If the chat is
     * not a private chat, the bot must be an administrator in the chat for this to
     * work and must have the 'can_pin_messages' administrator right in a supergroup or
     * 'can_edit_messages' administrator right in a channel. Returns True on success.    
     */
    public async unpinAllChatMessages (params: UnpinAllChatMessagesParams): Promise<boolean>
    {
        return this.request ('unpinAllChatMessages', params);
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
    public async getChatMemberCount (params: GetChatMemberCountParams): Promise<number>
    {
        return this.request ('getChatMemberCount', params);
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
     * administrator rights. Use the field can_set_sticker_set optionally returned in
     * getChat requests to check if the bot can use this method. Returns True on
     * success.    
     */
    public async setChatStickerSet (params: SetChatStickerSetParams): Promise<boolean>
    {
        return this.request ('setChatStickerSet', params);
    }

    /**
     * Use this method to delete a group sticker set from a supergroup. The bot must be
     * an administrator in the chat for this to work and must have the appropriate
     * administrator rights. Use the field can_set_sticker_set optionally returned in
     * getChat requests to check if the bot can use this method. Returns True on
     * success.    
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
     * Use this method to change the list of the bot's commands. See
     * https://core.telegram.org/bots#commands for more details about bot commands.
     * Returns True on success.    
     */
    public async setMyCommands (params: SetMyCommandsParams): Promise<boolean>
    {
        return this.request ('setMyCommands', params);
    }

    /**
     * Use this method to delete the list of the bot's commands for the given scope and
     * user language. After deletion, higher level commands will be shown to affected
     * users. Returns True on success.    
     */
    public async deleteMyCommands (params: DeleteMyCommandsParams): Promise<boolean>
    {
        return this.request ('deleteMyCommands', params);
    }

    /**
     * Use this method to get the current list of the bot's commands for the given
     * scope and user language. Returns Array of BotCommand on success. If commands
     * aren't set, an empty list is returned.    
     */
    public async getMyCommands (params: GetMyCommandsParams): Promise<Array<BotCommand>>
    {
        return this.request ('getMyCommands', params);
    }

    /**
     * Use this method to edit text and game messages. On success, if the edited
     * message is not an inline message, the edited Message is returned, otherwise True
     * is returned.    
     */
    public async editMessageText (params: EditMessageTextParams): Promise<Message | boolean>
    {
        return this.request ('editMessageText', params);
    }

    /**
     * Use this method to edit captions of messages. On success, if the edited message
     * is not an inline message, the edited Message is returned, otherwise True is
     * returned.    
     */
    public async editMessageCaption (params: EditMessageCaptionParams): Promise<Message | boolean>
    {
        return this.request ('editMessageCaption', params);
    }

    /**
     * Use this method to edit animation, audio, document, photo, or video messages. If
     * a message is part of a message album, then it can be edited only to an audio for
     * audio albums, only to a document for document albums and to a photo or a video
     * otherwise. When an inline message is edited, a new file can't be uploaded; use a
     * previously uploaded file via its file_id or specify a URL. On success, if the
     * edited message is not an inline message, the edited Message is returned,
     * otherwise True is returned.    
     */
    public async editMessageMedia (params: EditMessageMediaParams): Promise<Message | boolean>
    {
        return this.request ('editMessageMedia', params);
    }

    /**
     * Use this method to edit only the reply markup of messages. On success, if the
     * edited message is not an inline message, the edited Message is returned,
     * otherwise True is returned.    
     */
    public async editMessageReplyMarkup (params: EditMessageReplyMarkupParams): Promise<Message | boolean>
    {
        return this.request ('editMessageReplyMarkup', params);
    }

    /**
     * Use this method to stop a poll which was sent by the bot. On success, the
     * stopped Poll is returned.    
     */
    public async stopPoll (params: StopPollParams): Promise<Poll>
    {
        return this.request ('stopPoll', params);
    }

    /**
     * Use this method to delete a message, including service messages, with the
     * following limitations: - A message can only be deleted if it was sent less than
     * 48 hours ago. - A dice message in a private chat can only be deleted if it was
     * sent more than 24 hours ago. - Bots can delete outgoing messages in private
     * chats, groups, and supergroups. - Bots can delete incoming messages in private
     * chats. - Bots granted can_post_messages permissions can delete outgoing messages
     * in channels. - If the bot is an administrator of a group, it can delete any
     * message there. - If the bot has can_delete_messages permission in a supergroup
     * or a channel, it can delete any message there. Returns True on success.    
     */
    public async deleteMessage (params: DeleteMessageParams): Promise<boolean>
    {
        return this.request ('deleteMessage', params);
    }

    /**
     * Use this method to send static .WEBP or animated .TGS stickers. On success, the
     * sent Message is returned.    
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
     * Use this method to upload a .PNG file with a sticker for later use in
     * createNewStickerSet and addStickerToSet methods (can be used multiple times).
     * Returns the uploaded File on success.    
     */
    public async uploadStickerFile (params: UploadStickerFileParams): Promise<File>
    {
        return this.request ('uploadStickerFile', params);
    }

    /**
     * Use this method to create a new sticker set owned by a user. The bot will be
     * able to edit the sticker set thus created. You must use exactly one of the
     * fields png_sticker or tgs_sticker. Returns True on success.    
     */
    public async createNewStickerSet (params: CreateNewStickerSetParams): Promise<boolean>
    {
        return this.request ('createNewStickerSet', params);
    }

    /**
     * Use this method to add a new sticker to a set created by the bot. You must use
     * exactly one of the fields png_sticker or tgs_sticker. Animated stickers can be
     * added to animated sticker sets and only to them. Animated sticker sets can have
     * up to 50 stickers. Static sticker sets can have up to 120 stickers. Returns True
     * on success.    
     */
    public async addStickerToSet (params: AddStickerToSetParams): Promise<boolean>
    {
        return this.request ('addStickerToSet', params);
    }

    /**
     * Use this method to move a sticker in a set created by the bot to a specific
     * position. Returns True on success.    
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
     * Use this method to set the thumbnail of a sticker set. Animated thumbnails can
     * be set for animated sticker sets only. Returns True on success.    
     */
    public async setStickerSetThumb (params: SetStickerSetThumbParams): Promise<boolean>
    {
        return this.request ('setStickerSetThumb', params);
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
     * Use this method to set the score of the specified user in a game message. On
     * success, if the message is not an inline message, the Message is returned,
     * otherwise True is returned. Returns an error, if the new score is not greater
     * than the user's current score in the chat and force is False.    
     */
    public async setGameScore (params: SetGameScoreParams): Promise<Message | boolean>
    {
        return this.request ('setGameScore', params);
    }

    /**
     * Use this method to get data for high score tables. Will return the score of the
     * specified user and several of their neighbors in a game. On success, returns an
     * Array of GameHighScore objects.This method will currently return scores for the
     * target user, plus two of their closest neighbors on each side. Will also return
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
     * The update's unique identifier. Update identifiers start from a certain positive
     * number and increase sequentially. This ID becomes especially handy if you're
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

    /**
     * Optional. New poll state. Bots receive only updates about stopped polls and
     * polls, which are sent by the bot    
     */
    poll?: Poll,

    /**
     * Optional. A user changed their answer in a non-anonymous poll. Bots receive new
     * votes only in polls that were sent by the bot itself.    
     */
    poll_answer?: PollAnswer,

    /**
     * Optional. The bot's chat member status was updated in a chat. For private chats,
     * this update is received only when the bot is blocked or unblocked by the user.    
     */
    my_chat_member?: ChatMemberUpdated,

    /**
     * Optional. A chat member's status was updated in a chat. The bot must be an
     * administrator in the chat and must explicitly specify “chat_member” in the list
     * of allowed_updates to receive these updates.    
     */
    chat_member?: ChatMemberUpdated,

    /**
     * Optional. A request to join the chat has been sent. The bot must have the
     * can_invite_users administrator right in the chat to receive these updates.    
     */
    chat_join_request?: ChatJoinRequest,
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
     * Limits the number of updates to be retrieved. Values between 1-100 are accepted.
     * Defaults to 100.    
     */
    limit?: number,

    /**
     * Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling.
     * Should be positive, short polling should be used for testing purposes only.    
     */
    timeout?: number,

    /**
     * A JSON-serialized list of the update types you want your bot to receive. For
     * example, specify [“message”, “edited_channel_post”, “callback_query”] to only
     * receive updates of these types. See Update for a complete list of available
     * update types. Specify an empty list to receive all update types except
     * chat_member (default). If not specified, the previous setting will be used.
     * Please note that this parameter doesn't affect updates created before the call
     * to the getUpdates, so unwanted updates may be received for a short period of
     * time.    
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
 * https://www.example.com/<token>. Since nobody else knows your bot's token, you
 * can be pretty sure it's us.
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
     * The fixed IP address which will be used to send webhook requests instead of the
     * IP address resolved through DNS    
     */
    ip_address?: string,

    /**
     * Maximum allowed number of simultaneous HTTPS connections to the webhook for
     * update delivery, 1-100. Defaults to 40. Use lower values to limit the load on
     * your bot's server, and higher values to increase your bot's throughput.    
     */
    max_connections?: number,

    /**
     * A JSON-serialized list of the update types you want your bot to receive. For
     * example, specify [“message”, “edited_channel_post”, “callback_query”] to only
     * receive updates of these types. See Update for a complete list of available
     * update types. Specify an empty list to receive all update types except
     * chat_member (default). If not specified, the previous setting will be used.
     * Please note that this parameter doesn't affect updates created before the call
     * to the setWebhook, so unwanted updates may be received for a short period of
     * time.    
     */
    allowed_updates?: Array<string>,

    /**
     * Pass True to drop all pending updates    
     */
    drop_pending_updates?: boolean,
}

/**
 * Use this method to remove webhook integration if you decide to switch back to
 * getUpdates. Returns True on success.
 */
export interface DeleteWebhookParams
{

    /**
     * Pass True to drop all pending updates    
     */
    drop_pending_updates?: boolean,
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
     * Optional. Currently used webhook IP address    
     */
    ip_address?: string,

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
     * update types except chat_member    
     */
    allowed_updates?: Array<string>,
}

/**
 * This object represents a Telegram user or bot.
 */
export interface User
{

    /**
     * Unique identifier for this user or bot. This number may have more than 32
     * significant bits and some programming languages may have difficulty/silent
     * defects in interpreting it. But it has at most 52 significant bits, so a 64-bit
     * integer or double-precision float type are safe for storing this identifier.    
     */
    id: number,

    /**
     * True, if this user is a bot    
     */
    is_bot: boolean,

    /**
     * User's or bot's first name    
     */
    first_name: string,

    /**
     * Optional. User's or bot's last name    
     */
    last_name?: string,

    /**
     * Optional. User's or bot's username    
     */
    username?: string,

    /**
     * Optional. IETF language tag of the user's language    
     */
    language_code?: string,

    /**
     * Optional. True, if the bot can be invited to groups. Returned only in getMe.    
     */
    can_join_groups?: boolean,

    /**
     * Optional. True, if privacy mode is disabled for the bot. Returned only in getMe.    
     */
    can_read_all_group_messages?: boolean,

    /**
     * Optional. True, if the bot supports inline queries. Returned only in getMe.    
     */
    supports_inline_queries?: boolean,
}

/**
 * This object represents a chat.
 */
export interface Chat
{

    /**
     * Unique identifier for this chat. This number may have more than 32 significant
     * bits and some programming languages may have difficulty/silent defects in
     * interpreting it. But it has at most 52 significant bits, so a signed 64-bit
     * integer or double-precision float type are safe for storing this identifier.    
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
     * Optional. Chat photo. Returned only in getChat.    
     */
    photo?: ChatPhoto,

    /**
     * Optional. Bio of the other party in a private chat. Returned only in getChat.    
     */
    bio?: string,

    /**
     * Optional. True, if privacy settings of the other party in the private chat
     * allows to use tg://user?id=<user_id> links only in chats with the user. Returned
     * only in getChat.    
     */
    has_private_forwards?: boolean,

    /**
     * Optional. Description, for groups, supergroups and channel chats. Returned only
     * in getChat.    
     */
    description?: string,

    /**
     * Optional. Primary invite link, for groups, supergroups and channel chats.
     * Returned only in getChat.    
     */
    invite_link?: string,

    /**
     * Optional. The most recent pinned message (by sending date). Returned only in
     * getChat.    
     */
    pinned_message?: Message,

    /**
     * Optional. Default chat member permissions, for groups and supergroups. Returned
     * only in getChat.    
     */
    permissions?: ChatPermissions,

    /**
     * Optional. For supergroups, the minimum allowed delay between consecutive
     * messages sent by each unpriviledged user; in seconds. Returned only in getChat.    
     */
    slow_mode_delay?: number,

    /**
     * Optional. The time after which all messages sent to the chat will be
     * automatically deleted; in seconds. Returned only in getChat.    
     */
    message_auto_delete_time?: number,

    /**
     * Optional. True, if messages from the chat can't be forwarded to other chats.
     * Returned only in getChat.    
     */
    has_protected_content?: boolean,

    /**
     * Optional. For supergroups, name of group sticker set. Returned only in getChat.    
     */
    sticker_set_name?: string,

    /**
     * Optional. True, if the bot can change the group sticker set. Returned only in
     * getChat.    
     */
    can_set_sticker_set?: boolean,

    /**
     * Optional. Unique identifier for the linked chat, i.e. the discussion group
     * identifier for a channel and vice versa; for supergroups and channel chats. This
     * identifier may be greater than 32 bits and some programming languages may have
     * difficulty/silent defects in interpreting it. But it is smaller than 52 bits, so
     * a signed 64 bit integer or double-precision float type are safe for storing this
     * identifier. Returned only in getChat.    
     */
    linked_chat_id?: number,

    /**
     * Optional. For supergroups, the location to which the supergroup is connected.
     * Returned only in getChat.    
     */
    location?: ChatLocation,
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
     * Optional. Sender of the message; empty for messages sent to channels. For
     * backward compatibility, the field contains a fake sender user in non-channel
     * chats, if the message was sent on behalf of a chat.    
     */
    from?: User,

    /**
     * Optional. Sender of the message, sent on behalf of a chat. For example, the
     * channel itself for channel posts, the supergroup itself for messages from
     * anonymous group administrators, the linked channel for messages automatically
     * forwarded to the discussion group. For backward compatibility, the field from
     * contains a fake sender user in non-channel chats, if the message was sent on
     * behalf of a chat.    
     */
    sender_chat?: Chat,

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
     * Optional. For messages forwarded from channels or from anonymous administrators,
     * information about the original sender chat    
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
     * Optional. Sender's name for messages forwarded from users who disallow adding a
     * link to their account in forwarded messages    
     */
    forward_sender_name?: string,

    /**
     * Optional. For forwarded messages, date the original message was sent in Unix
     * time    
     */
    forward_date?: number,

    /**
     * Optional. True, if the message is a channel post that was automatically
     * forwarded to the connected discussion group    
     */
    is_automatic_forward?: boolean,

    /**
     * Optional. For replies, the original message. Note that the Message object in
     * this field will not contain further reply_to_message fields even if it itself is
     * a reply.    
     */
    reply_to_message?: Message,

    /**
     * Optional. Bot through which the message was sent    
     */
    via_bot?: User,

    /**
     * Optional. Date the message was last edited in Unix time    
     */
    edit_date?: number,

    /**
     * Optional. True, if the message can't be forwarded    
     */
    has_protected_content?: boolean,

    /**
     * Optional. The unique identifier of a media message group this message belongs to    
     */
    media_group_id?: string,

    /**
     * Optional. Signature of the post author for messages in channels, or the custom
     * title of an anonymous group administrator    
     */
    author_signature?: string,

    /**
     * Optional. For text messages, the actual UTF-8 text of the message, 0-4096
     * characters    
     */
    text?: string,

    /**
     * Optional. For text messages, special entities like usernames, URLs, bot
     * commands, etc. that appear in the text    
     */
    entities?: Array<MessageEntity>,

    /**
     * Optional. Message is an animation, information about the animation. For backward
     * compatibility, when this field is set, the document field will also be set    
     */
    animation?: Animation,

    /**
     * Optional. Message is an audio file, information about the file    
     */
    audio?: Audio,

    /**
     * Optional. Message is a general file, information about the file    
     */
    document?: Document,

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
     * Optional. Message is a video note, information about the video message    
     */
    video_note?: VideoNote,

    /**
     * Optional. Message is a voice message, information about the file    
     */
    voice?: Voice,

    /**
     * Optional. Caption for the animation, audio, document, photo, video or voice,
     * 0-1024 characters    
     */
    caption?: string,

    /**
     * Optional. For messages with a caption, special entities like usernames, URLs,
     * bot commands, etc. that appear in the caption    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Optional. Message is a shared contact, information about the contact    
     */
    contact?: Contact,

    /**
     * Optional. Message is a dice with random value    
     */
    dice?: Dice,

    /**
     * Optional. Message is a game, information about the game. More about games »    
     */
    game?: Game,

    /**
     * Optional. Message is a native poll, information about the poll    
     */
    poll?: Poll,

    /**
     * Optional. Message is a venue, information about the venue. For backward
     * compatibility, when this field is set, the location field will also be set    
     */
    venue?: Venue,

    /**
     * Optional. Message is a shared location, information about the location    
     */
    location?: Location,

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
     * Optional. Service message: the supergroup has been created. This field can't be
     * received in a message coming through updates, because bot can't be a member of a
     * supergroup when it is created. It can only be found in reply_to_message if
     * someone replies to a very first message in a directly created supergroup.    
     */
    supergroup_chat_created?: boolean,

    /**
     * Optional. Service message: the channel has been created. This field can't be
     * received in a message coming through updates, because bot can't be a member of a
     * channel when it is created. It can only be found in reply_to_message if someone
     * replies to a very first message in a channel.    
     */
    channel_chat_created?: boolean,

    /**
     * Optional. Service message: auto-delete timer settings changed in the chat    
     */
    message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged,

    /**
     * Optional. The group has been migrated to a supergroup with the specified
     * identifier. This number may have more than 32 significant bits and some
     * programming languages may have difficulty/silent defects in interpreting it. But
     * it has at most 52 significant bits, so a signed 64-bit integer or
     * double-precision float type are safe for storing this identifier.    
     */
    migrate_to_chat_id?: number,

    /**
     * Optional. The supergroup has been migrated from a group with the specified
     * identifier. This number may have more than 32 significant bits and some
     * programming languages may have difficulty/silent defects in interpreting it. But
     * it has at most 52 significant bits, so a signed 64-bit integer or
     * double-precision float type are safe for storing this identifier.    
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

    /**
     * Optional. Service message. A user in the chat triggered another user's proximity
     * alert while sharing Live Location.    
     */
    proximity_alert_triggered?: ProximityAlertTriggered,

    /**
     * Optional. Service message: voice chat scheduled    
     */
    voice_chat_scheduled?: VoiceChatScheduled,

    /**
     * Optional. Service message: voice chat started    
     */
    voice_chat_started?: VoiceChatStarted,

    /**
     * Optional. Service message: voice chat ended    
     */
    voice_chat_ended?: VoiceChatEnded,

    /**
     * Optional. Service message: new participants invited to a voice chat    
     */
    voice_chat_participants_invited?: VoiceChatParticipantsInvited,

    /**
     * Optional. Inline keyboard attached to the message. login_url buttons are
     * represented as ordinary url buttons.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * This object represents a unique message identifier.
 */
export interface MessageId
{

    /**
     * Unique message identifier    
     */
    message_id: number,
}

/**
 * This object represents one special entity in a text message. For example,
 * hashtags, usernames, URLs, etc.
 */
export interface MessageEntity
{

    /**
     * Type of the entity. Can be “mention” (@username), “hashtag” (#hashtag),
     * “cashtag” ($USD), “bot_command” (/start@jobs_bot), “url” (https://telegram.org),
     * “email” (do-not-reply@telegram.org), “phone_number” (+1-212-555-0123), “bold”
     * (bold text), “italic” (italic text), “underline” (underlined text),
     * “strikethrough” (strikethrough text), “code” (monowidth string), “pre”
     * (monowidth block), “text_link” (for clickable text URLs), “text_mention” (for
     * users without usernames)    
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

    /**
     * Optional. For “pre” only, the programming language of the entity text    
     */
    language?: string,
}

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 */
export interface PhotoSize
{

    /**
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

    /**
     * Photo width    
     */
    width: number,

    /**
     * Photo height    
     */
    height: number,

    /**
     * Optional. File size in bytes    
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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

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
     * Optional. File size in bytes    
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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

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
     * Optional. Original filename as defined by sender    
     */
    file_name?: string,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size in bytes    
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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

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
     * Optional. File size in bytes    
     */
    file_size?: number,
}

/**
 * This object represents a video file.
 */
export interface Video
{

    /**
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

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
     * Optional. Original filename as defined by sender    
     */
    file_name?: string,

    /**
     * Optional. Mime type of a file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size in bytes    
     */
    file_size?: number,
}

/**
 * This object represents a video message (available in Telegram apps as of v.4.0).
 */
export interface VideoNote
{

    /**
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

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
     * Optional. File size in bytes    
     */
    file_size?: number,
}

/**
 * This object represents a voice note.
 */
export interface Voice
{

    /**
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

    /**
     * Duration of the audio in seconds as defined by sender    
     */
    duration: number,

    /**
     * Optional. MIME type of the file as defined by sender    
     */
    mime_type?: string,

    /**
     * Optional. File size in bytes    
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
     * Optional. Contact's user identifier in Telegram. This number may have more than
     * 32 significant bits and some programming languages may have difficulty/silent
     * defects in interpreting it. But it has at most 52 significant bits, so a 64-bit
     * integer or double-precision float type are safe for storing this identifier.    
     */
    user_id?: number,

    /**
     * Optional. Additional data about the contact in the form of a vCard    
     */
    vcard?: string,
}

/**
 * This object represents an animated emoji that displays a random value.
 */
export interface Dice
{

    /**
     * Emoji on which the dice throw animation is based    
     */
    emoji: string,

    /**
     * Value of the dice, 1-6 for “”, “” and “” base emoji, 1-5 for “” and “” base
     * emoji, 1-64 for “” base emoji    
     */
    value: number,
}

/**
 * This object contains information about one answer option in a poll.
 */
export interface PollOption
{

    /**
     * Option text, 1-100 characters    
     */
    text: string,

    /**
     * Number of users that voted for this option    
     */
    voter_count: number,
}

/**
 * This object represents an answer of a user in a non-anonymous poll.
 */
export interface PollAnswer
{

    /**
     * Unique poll identifier    
     */
    poll_id: string,

    /**
     * The user, who changed the answer to the poll    
     */
    user: User,

    /**
     * 0-based identifiers of answer options, chosen by the user. May be empty if the
     * user retracted their vote.    
     */
    option_ids: Array<number>,
}

/**
 * This object contains information about a poll.
 */
export interface Poll
{

    /**
     * Unique poll identifier    
     */
    id: string,

    /**
     * Poll question, 1-300 characters    
     */
    question: string,

    /**
     * List of poll options    
     */
    options: Array<PollOption>,

    /**
     * Total number of users that voted in the poll    
     */
    total_voter_count: number,

    /**
     * True, if the poll is closed    
     */
    is_closed: boolean,

    /**
     * True, if the poll is anonymous    
     */
    is_anonymous: boolean,

    /**
     * Poll type, currently can be “regular” or “quiz”    
     */
    type: string,

    /**
     * True, if the poll allows multiple answers    
     */
    allows_multiple_answers: boolean,

    /**
     * Optional. 0-based identifier of the correct answer option. Available only for
     * polls in the quiz mode, which are closed, or was sent (not forwarded) by the bot
     * or to the private chat with the bot.    
     */
    correct_option_id?: number,

    /**
     * Optional. Text that is shown when a user chooses an incorrect answer or taps on
     * the lamp icon in a quiz-style poll, 0-200 characters    
     */
    explanation?: string,

    /**
     * Optional. Special entities like usernames, URLs, bot commands, etc. that appear
     * in the explanation    
     */
    explanation_entities?: Array<MessageEntity>,

    /**
     * Optional. Amount of time in seconds the poll will be active after creation    
     */
    open_period?: number,

    /**
     * Optional. Point in time (Unix timestamp) when the poll will be automatically
     * closed    
     */
    close_date?: number,
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

    /**
     * Optional. The radius of uncertainty for the location, measured in meters; 0-1500    
     */
    horizontal_accuracy?: any,

    /**
     * Optional. Time relative to the message sending date, during which the location
     * can be updated; in seconds. For active live locations only.    
     */
    live_period?: number,

    /**
     * Optional. The direction in which user is moving, in degrees; 1-360. For active
     * live locations only.    
     */
    heading?: number,

    /**
     * Optional. Maximum distance for proximity alerts about approaching another chat
     * member, in meters. For sent live locations only.    
     */
    proximity_alert_radius?: number,
}

/**
 * This object represents a venue.
 */
export interface Venue
{

    /**
     * Venue location. Can't be a live location    
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

    /**
     * Optional. Google Places identifier of the venue    
     */
    google_place_id?: string,

    /**
     * Optional. Google Places type of the venue. (See supported types.)    
     */
    google_place_type?: string,
}

/**
 * This object represents the content of a service message, sent whenever a user in
 * the chat triggers a proximity alert set by another user.
 */
export interface ProximityAlertTriggered
{

    /**
     * User that triggered the alert    
     */
    traveler: User,

    /**
     * User that set the alert    
     */
    watcher: User,

    /**
     * The distance between the users    
     */
    distance: number,
}

/**
 * This object represents a service message about a change in auto-delete timer
 * settings.
 */
export interface MessageAutoDeleteTimerChanged
{

    /**
     * New auto-delete time for messages in the chat; in seconds    
     */
    message_auto_delete_time: number,
}

/**
 * This object represents a service message about a voice chat scheduled in the
 * chat.
 */
export interface VoiceChatScheduled
{

    /**
     * Point in time (Unix timestamp) when the voice chat is supposed to be started by
     * a chat administrator    
     */
    start_date: number,
}

/**
 * This object represents a service message about a voice chat ended in the chat.
 */
export interface VoiceChatEnded
{

    /**
     * Voice chat duration in seconds    
     */
    duration: number,
}

/**
 * This object represents a service message about new members invited to a voice
 * chat.
 */
export interface VoiceChatParticipantsInvited
{

    /**
     * Optional. New members that were invited to the voice chat    
     */
    users?: Array<User>,
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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

    /**
     * Optional. File size in bytes, if known    
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
     * Optional. The placeholder to be shown in the input field when the keyboard is
     * active; 1-64 characters    
     */
    input_field_placeholder?: string,

    /**
     * Optional. Use this parameter if you want to show the keyboard to specific users
     * only. Targets: 1) users that are @mentioned in the text of the Message object;
     * 2) if the bot's message is a reply (has reply_to_message_id), sender of the
     * original message. Example: A user requests to change the bot's language, bot
     * replies to the request with a keyboard to select the new language. Other users
     * in the group don't see the keyboard.    
     */
    selective?: boolean,
}

/**
 * This object represents one button of the reply keyboard. For simple text buttons
 * String can be used instead of this object to specify text of the button.
 * Optional fields request_contact, request_location, and request_poll are mutually
 * exclusive.
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

    /**
     * Optional. If specified, the user will be asked to create a poll and send it to
     * the bot when the button is pressed. Available in private chats only    
     */
    request_poll?: KeyboardButtonPollType,
}

/**
 * This object represents type of a poll, which is allowed to be created and sent
 * when the corresponding button is pressed.
 */
export interface KeyboardButtonPollType
{

    /**
     * Optional. If quiz is passed, the user will be allowed to create only polls in
     * the quiz mode. If regular is passed, only regular polls will be allowed.
     * Otherwise, the user will be allowed to create a poll of any type.    
     */
    type?: string,
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
     * Optional. HTTP or tg:// url to be opened when the button is pressed. Links
     * tg://user?id=<user_id> can be used to mention a user by their ID without using a
     * username, if this is allowed by their privacy settings.    
     */
    url?: string,

    /**
     * Optional. An HTTP URL used to automatically authorize the user. Can be used as a
     * replacement for the Telegram Login Widget.    
     */
    login_url?: LoginUrl,

    /**
     * Optional. Data to be sent in a callback query to the bot when button is pressed,
     * 1-64 bytes    
     */
    callback_data?: string,

    /**
     * Optional. If set, pressing the button will prompt the user to select one of
     * their chats, open that chat and insert the bot's username and the specified
     * inline query in the input field. Can be empty, in which case just the bot's
     * username will be inserted. Note: This offers an easy way for users to start
     * using your bot in inline mode when they are currently in a private chat with it.
     * Especially useful when combined with switch_pm… actions – in this case the user
     * will be automatically returned to the chat they switched from, skipping the chat
     * selection screen.    
     */
    switch_inline_query?: string,

    /**
     * Optional. If set, pressing the button will insert the bot's username and the
     * specified inline query in the current chat's input field. Can be empty, in which
     * case only the bot's username will be inserted. This offers a quick way for the
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
     * always be the first button in the first row and can only be used in invoice
     * messages.    
     */
    pay?: boolean,
}

/**
 * This object represents a parameter of the inline keyboard button used to
 * automatically authorize a user. Serves as a great replacement for the Telegram
 * Login Widget when the user is coming from Telegram. All the user needs to do is
 * tap/click a button and confirm that they want to log in:Telegram apps support
 * these buttons as of version 5.7.Sample bot: @discussbot
 */
export interface LoginUrl
{

    /**
     * An HTTP URL to be opened with user authorization data added to the query string
     * when the button is pressed. If the user refuses to provide authorization data,
     * the original URL without information about the user will be opened. The data
     * added is the same as described in Receiving authorization data. NOTE: You must
     * always check the hash of the received data to verify the authentication and the
     * integrity of the data as described in Checking authorization.    
     */
    url: string,

    /**
     * Optional. New text of the button in forwarded messages.    
     */
    forward_text?: string,

    /**
     * Optional. Username of a bot, which will be used for user authorization. See
     * Setting up a bot for more details. If not specified, the current bot's username
     * will be assumed. The url's domain must be the same as the domain linked with the
     * bot. See Linking your domain to the bot for more details.    
     */
    bot_username?: string,

    /**
     * Optional. Pass True to request the permission for your bot to send messages to
     * the user.    
     */
    request_write_access?: boolean,
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
 * interface to the user (act as if the user has selected the bot's message and
 * tapped 'Reply'). This can be extremely useful if you want to create
 * user-friendly step-by-step interfaces without having to sacrifice privacy mode.
 */
export interface ForceReply
{

    /**
     * Shows reply interface to the user, as if they manually selected the bot's
     * message and tapped 'Reply'    
     */
    force_reply: boolean,

    /**
     * Optional. The placeholder to be shown in the input field when the reply is
     * active; 1-64 characters    
     */
    input_field_placeholder?: string,

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
     * File identifier of small (160x160) chat photo. This file_id can be used only for
     * photo download and only for as long as the photo is not changed.    
     */
    small_file_id: string,

    /**
     * Unique file identifier of small (160x160) chat photo, which is supposed to be
     * the same over time and for different bots. Can't be used to download or reuse
     * the file.    
     */
    small_file_unique_id: string,

    /**
     * File identifier of big (640x640) chat photo. This file_id can be used only for
     * photo download and only for as long as the photo is not changed.    
     */
    big_file_id: string,

    /**
     * Unique file identifier of big (640x640) chat photo, which is supposed to be the
     * same over time and for different bots. Can't be used to download or reuse the
     * file.    
     */
    big_file_unique_id: string,
}

/**
 * Represents an invite link for a chat.
 */
export interface ChatInviteLink
{

    /**
     * The invite link. If the link was created by another chat administrator, then the
     * second part of the link will be replaced with “…”.    
     */
    invite_link: string,

    /**
     * Creator of the link    
     */
    creator: User,

    /**
     * True, if users joining the chat via the link need to be approved by chat
     * administrators    
     */
    creates_join_request: boolean,

    /**
     * True, if the link is primary    
     */
    is_primary: boolean,

    /**
     * True, if the link is revoked    
     */
    is_revoked: boolean,

    /**
     * Optional. Invite link name    
     */
    name?: string,

    /**
     * Optional. Point in time (Unix timestamp) when the link will expire or has been
     * expired    
     */
    expire_date?: number,

    /**
     * Optional. Maximum number of users that can be members of the chat simultaneously
     * after joining the chat via this invite link; 1-99999    
     */
    member_limit?: number,

    /**
     * Optional. Number of pending join requests created using this link    
     */
    pending_join_request_count?: number,
}

/**
 * Represents a chat member that owns the chat and has all administrator
 * privileges.
 */
export interface ChatMemberOwner extends ChatMember
{

    /**
     * The member's status in the chat, always “creator”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,

    /**
     * True, if the user's presence in the chat is hidden    
     */
    is_anonymous: boolean,

    /**
     * Optional. Custom title for this user    
     */
    custom_title?: string,
}

/**
 * Represents a chat member that has some additional privileges.
 */
export interface ChatMemberAdministrator extends ChatMember
{

    /**
     * The member's status in the chat, always “administrator”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,

    /**
     * True, if the bot is allowed to edit administrator privileges of that user    
     */
    can_be_edited: boolean,

    /**
     * True, if the user's presence in the chat is hidden    
     */
    is_anonymous: boolean,

    /**
     * True, if the administrator can access the chat event log, chat statistics,
     * message statistics in channels, see channel members, see anonymous
     * administrators in supergroups and ignore slow mode. Implied by any other
     * administrator privilege    
     */
    can_manage_chat: boolean,

    /**
     * True, if the administrator can delete messages of other users    
     */
    can_delete_messages: boolean,

    /**
     * True, if the administrator can manage voice chats    
     */
    can_manage_voice_chats: boolean,

    /**
     * True, if the administrator can restrict, ban or unban chat members    
     */
    can_restrict_members: boolean,

    /**
     * True, if the administrator can add new administrators with a subset of their own
     * privileges or demote administrators that he has promoted, directly or indirectly
     * (promoted by administrators that were appointed by the user)    
     */
    can_promote_members: boolean,

    /**
     * True, if the user is allowed to change the chat title, photo and other settings    
     */
    can_change_info: boolean,

    /**
     * True, if the user is allowed to invite new users to the chat    
     */
    can_invite_users: boolean,

    /**
     * Optional. True, if the administrator can post in the channel; channels only    
     */
    can_post_messages?: boolean,

    /**
     * Optional. True, if the administrator can edit messages of other users and can
     * pin messages; channels only    
     */
    can_edit_messages?: boolean,

    /**
     * Optional. True, if the user is allowed to pin messages; groups and supergroups
     * only    
     */
    can_pin_messages?: boolean,

    /**
     * Optional. Custom title for this user    
     */
    custom_title?: string,
}

/**
 * Represents a chat member that has no additional privileges or restrictions.
 */
export interface ChatMemberMember extends ChatMember
{

    /**
     * The member's status in the chat, always “member”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,
}

/**
 * Represents a chat member that is under certain restrictions in the chat.
 * Supergroups only.
 */
export interface ChatMemberRestricted extends ChatMember
{

    /**
     * The member's status in the chat, always “restricted”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,

    /**
     * True, if the user is a member of the chat at the moment of the request    
     */
    is_member: boolean,

    /**
     * True, if the user is allowed to change the chat title, photo and other settings    
     */
    can_change_info: boolean,

    /**
     * True, if the user is allowed to invite new users to the chat    
     */
    can_invite_users: boolean,

    /**
     * True, if the user is allowed to pin messages    
     */
    can_pin_messages: boolean,

    /**
     * True, if the user is allowed to send text messages, contacts, locations and
     * venues    
     */
    can_send_messages: boolean,

    /**
     * True, if the user is allowed to send audios, documents, photos, videos, video
     * notes and voice notes    
     */
    can_send_media_messages: boolean,

    /**
     * True, if the user is allowed to send polls    
     */
    can_send_polls: boolean,

    /**
     * True, if the user is allowed to send animations, games, stickers and use inline
     * bots    
     */
    can_send_other_messages: boolean,

    /**
     * True, if the user is allowed to add web page previews to their messages    
     */
    can_add_web_page_previews: boolean,

    /**
     * Date when restrictions will be lifted for this user; unix time. If 0, then the
     * user is restricted forever    
     */
    until_date: number,
}

/**
 * Represents a chat member that isn't currently a member of the chat, but may join
 * it themselves.
 */
export interface ChatMemberLeft extends ChatMember
{

    /**
     * The member's status in the chat, always “left”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,
}

/**
 * Represents a chat member that was banned in the chat and can't return to the
 * chat or view chat messages.
 */
export interface ChatMemberBanned extends ChatMember
{

    /**
     * The member's status in the chat, always “kicked”    
     */
    status: string,

    /**
     * Information about the user    
     */
    user: User,

    /**
     * Date when restrictions will be lifted for this user; unix time. If 0, then the
     * user is banned forever    
     */
    until_date: number,
}

/**
 * This object represents changes in the status of a chat member.
 */
export interface ChatMemberUpdated extends ChatMember
{

    /**
     * Chat the user belongs to    
     */
    chat: Chat,

    /**
     * Performer of the action, which resulted in the change    
     */
    from: User,

    /**
     * Date the change was done in Unix time    
     */
    date: number,

    /**
     * Previous information about the chat member    
     */
    old_chat_member: ChatMember,

    /**
     * New information about the chat member    
     */
    new_chat_member: ChatMember,

    /**
     * Optional. Chat invite link, which was used by the user to join the chat; for
     * joining by invite link events only.    
     */
    invite_link?: ChatInviteLink,
}

/**
 * Represents a join request sent to a chat.
 */
export interface ChatJoinRequest
{

    /**
     * Chat to which the request was sent    
     */
    chat: Chat,

    /**
     * User that sent the join request    
     */
    from: User,

    /**
     * Date the request was sent in Unix time    
     */
    date: number,

    /**
     * Optional. Bio of the user.    
     */
    bio?: string,

    /**
     * Optional. Chat invite link that was used by the user to send the join request    
     */
    invite_link?: ChatInviteLink,
}

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 */
export interface ChatPermissions
{

    /**
     * Optional. True, if the user is allowed to send text messages, contacts,
     * locations and venues    
     */
    can_send_messages?: boolean,

    /**
     * Optional. True, if the user is allowed to send audios, documents, photos,
     * videos, video notes and voice notes, implies can_send_messages    
     */
    can_send_media_messages?: boolean,

    /**
     * Optional. True, if the user is allowed to send polls, implies can_send_messages    
     */
    can_send_polls?: boolean,

    /**
     * Optional. True, if the user is allowed to send animations, games, stickers and
     * use inline bots, implies can_send_media_messages    
     */
    can_send_other_messages?: boolean,

    /**
     * Optional. True, if the user is allowed to add web page previews to their
     * messages, implies can_send_media_messages    
     */
    can_add_web_page_previews?: boolean,

    /**
     * Optional. True, if the user is allowed to change the chat title, photo and other
     * settings. Ignored in public supergroups    
     */
    can_change_info?: boolean,

    /**
     * Optional. True, if the user is allowed to invite new users to the chat    
     */
    can_invite_users?: boolean,

    /**
     * Optional. True, if the user is allowed to pin messages. Ignored in public
     * supergroups    
     */
    can_pin_messages?: boolean,
}

/**
 * Represents a location to which a chat is connected.
 */
export interface ChatLocation
{

    /**
     * The location to which the supergroup is connected. Can't be a live location.    
     */
    location: Location,

    /**
     * Location address; 1-64 characters, as defined by the chat owner    
     */
    address: string,
}

/**
 * This object represents a bot command.
 */
export interface BotCommand
{

    /**
     * Text of the command; 1-32 characters. Can contain only lowercase English
     * letters, digits and underscores.    
     */
    command: string,

    /**
     * Description of the command; 1-256 characters.    
     */
    description: string,
}

/**
 * Represents the default scope of bot commands. Default commands are used if no
 * commands with a narrower scope are specified for the user.
 */
export interface BotCommandScopeDefault extends BotCommandScope
{

    /**
     * Scope type, must be default    
     */
    type: string,
}

/**
 * Represents the scope of bot commands, covering all private chats.
 */
export interface BotCommandScopeAllPrivateChats extends BotCommandScope
{

    /**
     * Scope type, must be all_private_chats    
     */
    type: string,
}

/**
 * Represents the scope of bot commands, covering all group and supergroup chats.
 */
export interface BotCommandScopeAllGroupChats extends BotCommandScope
{

    /**
     * Scope type, must be all_group_chats    
     */
    type: string,
}

/**
 * Represents the scope of bot commands, covering all group and supergroup chat
 * administrators.
 */
export interface BotCommandScopeAllChatAdministrators extends BotCommandScope
{

    /**
     * Scope type, must be all_chat_administrators    
     */
    type: string,
}

/**
 * Represents the scope of bot commands, covering a specific chat.
 */
export interface BotCommandScopeChat extends BotCommandScope
{

    /**
     * Scope type, must be chat    
     */
    type: string,

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,
}

/**
 * Represents the scope of bot commands, covering all administrators of a specific
 * group or supergroup chat.
 */
export interface BotCommandScopeChatAdministrators extends BotCommandScope
{

    /**
     * Scope type, must be chat_administrators    
     */
    type: string,

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,
}

/**
 * Represents the scope of bot commands, covering a specific member of a group or
 * supergroup chat.
 */
export interface BotCommandScopeChatMember extends BotCommandScope
{

    /**
     * Scope type, must be chat_member    
     */
    type: string,

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target user    
     */
    user_id: number,
}

/**
 * Contains information about why a request was unsuccessful.
 */
export interface ResponseParameters
{

    /**
     * Optional. The group has been migrated to a supergroup with the specified
     * identifier. This number may have more than 32 significant bits and some
     * programming languages may have difficulty/silent defects in interpreting it. But
     * it has at most 52 significant bits, so a signed 64-bit integer or
     * double-precision float type are safe for storing this identifier.    
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
     * Optional. Caption of the photo to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the photo caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,
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
     * Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for
     * the file is supported server-side. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the video to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the video caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Optional. Video width    
     */
    width?: number,

    /**
     * Optional. Video height    
     */
    height?: number,

    /**
     * Optional. Video duration in seconds    
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
     * Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for
     * the file is supported server-side. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the animation to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the animation caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Optional. Animation width    
     */
    width?: number,

    /**
     * Optional. Animation height    
     */
    height?: number,

    /**
     * Optional. Animation duration in seconds    
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
     * Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for
     * the file is supported server-side. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the audio to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the audio caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for
     * the file is supported server-side. The thumbnail should be in JPEG format and
     * less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't
     * be reused and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Optional. Caption of the document to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the document caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Optional. Disables automatic server-side content type detection for files
     * uploaded using multipart/form-data. Always True, if the document is sent as part
     * of an album.    
     */
    disable_content_type_detection?: boolean,
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
     * Text of the message to be sent, 1-4096 characters after entities parsing    
     */
    text: string,

    /**
     * Mode for parsing entities in the message text. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in message text, which
     * can be specified instead of parse_mode    
     */
    entities?: Array<MessageEntity>,

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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to forward messages of any kind. Service messages can't be
 * forwarded. On success, the sent Message is returned.
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
 * Use this method to copy messages of any kind. Service messages and invoice
 * messages can't be copied. The method is analogous to the method forwardMessage,
 * but the copied message doesn't have a link to the original message. Returns the
 * MessageId of the sent message on success.
 */
export interface CopyMessageParams
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
     * Message identifier in the chat specified in from_chat_id    
     */
    message_id: number,

    /**
     * New caption for media, 0-1024 characters after entities parsing. If not
     * specified, the original caption is kept    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the new caption. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the new caption, which
     * can be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
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
     * a photo from the Internet, or upload a new photo using multipart/form-data. The
     * photo must be at most 10 MB in size. The photo's width and height must not
     * exceed 10000 in total. Width and height ratio must be at most 20. More info on
     * Sending Files »    
     */
    photo: { name: string, data: Buffer } | string,

    /**
     * Photo caption (may also be used when resending photos by file_id), 0-1024
     * characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the photo caption. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send audio files, if you want Telegram clients to display
 * them in the music player. Your audio must be in the .MP3 or .M4A format. On
 * success, the sent Message is returned. Bots can currently send audio files of up
 * to 50 MB in size, this limit may be changed in the future.For sending voice
 * messages, use the sendVoice method instead.
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
     * Audio caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the audio caption. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file
     * is supported server-side. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can't be reused
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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file
     * is supported server-side. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can't be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Document caption (may also be used when resending documents by file_id), 0-1024
     * characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the document caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Disables automatic server-side content type detection for files uploaded using
     * multipart/form-data    
     */
    disable_content_type_detection?: boolean,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file
     * is supported server-side. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can't be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Video caption (may also be used when resending videos by file_id), 0-1024
     * characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the video caption. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file
     * is supported server-side. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can't be reused
     * and can be only uploaded as a new file, so you can pass
     * “attach://<file_attach_name>” if the thumbnail was uploaded using
     * multipart/form-data under <file_attach_name>. More info on Sending Files »    
     */
    thumb?: { name: string, data: Buffer } | string,

    /**
     * Animation caption (may also be used when resending animation by file_id), 0-1024
     * characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the animation caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
 * .OGG file encoded with OPUS (other formats may be sent as Audio or Document). On
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
     * Voice message caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the voice message caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Thumbnail of the file sent; can be ignored if thumbnail generation for the file
     * is supported server-side. The thumbnail should be in JPEG format and less than
     * 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if
     * the file is not uploaded using multipart/form-data. Thumbnails can't be reused
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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send a group of photos, videos, documents or audios as an
 * album. Documents and audio files can be only grouped in an album with messages
 * of the same type. On success, an array of Messages that were sent is returned.
 */
export interface SendMediaGroupParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * A JSON-serialized array describing messages to be sent, must include 2-10 items    
     */
    media: any,

    /**
     * Sends messages silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the messages are a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,
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
     * The radius of uncertainty for the location, measured in meters; 0-1500    
     */
    horizontal_accuracy?: any,

    /**
     * Period in seconds for which the location will be updated (see Live Locations,
     * should be between 60 and 86400.    
     */
    live_period?: number,

    /**
     * For live locations, a direction in which the user is moving, in degrees. Must be
     * between 1 and 360 if specified.    
     */
    heading?: number,

    /**
     * For live locations, a maximum distance for proximity alerts about approaching
     * another chat member, in meters. Must be between 1 and 100000 if specified.    
     */
    proximity_alert_radius?: number,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to edit live location messages. A location can be edited until
 * its live_period expires or editing is explicitly disabled by a call to
 * stopMessageLiveLocation. On success, if the edited message is not an inline
 * message, the edited Message is returned, otherwise True is returned.
 */
export interface EditMessageLiveLocationParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message to
     * edit    
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
     * The radius of uncertainty for the location, measured in meters; 0-1500    
     */
    horizontal_accuracy?: any,

    /**
     * Direction in which the user is moving, in degrees. Must be between 1 and 360 if
     * specified.    
     */
    heading?: number,

    /**
     * Maximum distance for proximity alerts about approaching another chat member, in
     * meters. Must be between 1 and 100000 if specified.    
     */
    proximity_alert_radius?: number,

    /**
     * A JSON-serialized object for a new inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to stop updating a live location message before live_period
 * expires. On success, if the message is not an inline message, the edited Message
 * is returned, otherwise True is returned.
 */
export interface StopMessageLiveLocationParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message with
     * live location to stop    
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
     * Google Places identifier of the venue    
     */
    google_place_id?: string,

    /**
     * Google Places type of the venue. (See supported types.)    
     */
    google_place_type?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove keyboard or to force a reply from
     * the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send a native poll. On success, the sent Message is returned.
 */
export interface SendPollParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Poll question, 1-300 characters    
     */
    question: string,

    /**
     * A JSON-serialized list of answer options, 2-10 strings 1-100 characters each    
     */
    options: Array<string>,

    /**
     * True, if the poll needs to be anonymous, defaults to True    
     */
    is_anonymous?: boolean,

    /**
     * Poll type, “quiz” or “regular”, defaults to “regular”    
     */
    type?: string,

    /**
     * True, if the poll allows multiple answers, ignored for polls in quiz mode,
     * defaults to False    
     */
    allows_multiple_answers?: boolean,

    /**
     * 0-based identifier of the correct answer option, required for polls in quiz mode    
     */
    correct_option_id?: number,

    /**
     * Text that is shown when a user chooses an incorrect answer or taps on the lamp
     * icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after
     * entities parsing    
     */
    explanation?: string,

    /**
     * Mode for parsing entities in the explanation. See formatting options for more
     * details.    
     */
    explanation_parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the poll explanation,
     * which can be specified instead of parse_mode    
     */
    explanation_entities?: Array<MessageEntity>,

    /**
     * Amount of time in seconds the poll will be active after creation, 5-600. Can't
     * be used together with close_date.    
     */
    open_period?: number,

    /**
     * Point in time (Unix timestamp) when the poll will be automatically closed. Must
     * be at least 5 and no more than 600 seconds in the future. Can't be used together
     * with open_period.    
     */
    close_date?: number,

    /**
     * Pass True, if the poll needs to be immediately closed. This can be useful for
     * poll preview.    
     */
    is_closed?: boolean,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
     */
    reply_markup?: any,
}

/**
 * Use this method to send an animated emoji that will display a random value. On
 * success, the sent Message is returned.
 */
export interface SendDiceParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Emoji on which the dice throw animation is based. Currently, must be one of “”,
     * “”, “”, “”, “”, or “”. Dice can have values 1-6 for “”, “” and “”, values 1-5
     * for “” and “”, and values 1-64 for “”. Defaults to “”    
     */
    emoji?: string,

    /**
     * Sends the message silently. Users will receive a notification with no sound.    
     */
    disable_notification?: boolean,

    /**
     * If the message is a reply, ID of the original message    
     */
    reply_to_message_id?: number,

    /**
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * Additional interface options. A JSON-serialized object for an inline keyboard,
     * custom reply keyboard, instructions to remove reply keyboard or to force a reply
     * from the user.    
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
 * The user will see a “sending photo” status for the bot.We only recommend using
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
     * upload_video for videos, record_voice or upload_voice for voice notes,
     * upload_document for general files, choose_sticker for stickers, find_location
     * for location data, record_video_note or upload_video_note for video notes.    
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
     * Limits the number of photos to be retrieved. Values between 1-100 are accepted.
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
 * Use this method to ban a user in a group, a supergroup or a channel. In the case
 * of supergroups and channels, the user will not be able to return to the chat on
 * their own using invite links, etc., unless unbanned first. The bot must be an
 * administrator in the chat for this to work and must have the appropriate
 * administrator rights. Returns True on success.
 */
export interface BanChatMemberParams
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
     * banned forever. Applied for supergroups and channels only.    
     */
    until_date?: number,

    /**
     * Pass True to delete all messages from the chat for the user that is being
     * removed. If False, the user will be able to see messages in the group that were
     * sent before the user was removed. Always True for supergroups and channels.    
     */
    revoke_messages?: boolean,
}

/**
 * Use this method to unban a previously banned user in a supergroup or channel.
 * The user will not return to the group or channel automatically, but will be able
 * to join via link, etc. The bot must be an administrator for this to work. By
 * default, this method guarantees that after the call the user is not a member of
 * the chat, but will be able to join it. So if the user is a member of the chat
 * they will also be removed from the chat. If you don't want this, use the
 * parameter only_if_banned. Returns True on success.
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

    /**
     * Do nothing if the user is not banned    
     */
    only_if_banned?: boolean,
}

/**
 * Use this method to restrict a user in a supergroup. The bot must be an
 * administrator in the supergroup for this to work and must have the appropriate
 * administrator rights. Pass True for all permissions to lift restrictions from a
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
     * A JSON-serialized object for new user permissions    
     */
    permissions: ChatPermissions,

    /**
     * Date when restrictions will be lifted for the user, unix time. If user is
     * restricted for more than 366 days or less than 30 seconds from the current time,
     * they are considered to be restricted forever    
     */
    until_date?: number,
}

/**
 * Use this method to promote or demote a user in a supergroup or a channel. The
 * bot must be an administrator in the chat for this to work and must have the
 * appropriate administrator rights. Pass False for all boolean parameters to
 * demote a user. Returns True on success.
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
     * Pass True, if the administrator's presence in the chat is hidden    
     */
    is_anonymous?: boolean,

    /**
     * Pass True, if the administrator can access the chat event log, chat statistics,
     * message statistics in channels, see channel members, see anonymous
     * administrators in supergroups and ignore slow mode. Implied by any other
     * administrator privilege    
     */
    can_manage_chat?: boolean,

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
     * Pass True, if the administrator can manage voice chats    
     */
    can_manage_voice_chats?: boolean,

    /**
     * Pass True, if the administrator can restrict, ban or unban chat members    
     */
    can_restrict_members?: boolean,

    /**
     * Pass True, if the administrator can add new administrators with a subset of
     * their own privileges or demote administrators that he has promoted, directly or
     * indirectly (promoted by administrators that were appointed by him)    
     */
    can_promote_members?: boolean,

    /**
     * Pass True, if the administrator can change chat title, photo and other settings    
     */
    can_change_info?: boolean,

    /**
     * Pass True, if the administrator can invite new users to the chat    
     */
    can_invite_users?: boolean,

    /**
     * Pass True, if the administrator can pin messages, supergroups only    
     */
    can_pin_messages?: boolean,
}

/**
 * Use this method to set a custom title for an administrator in a supergroup
 * promoted by the bot. Returns True on success.
 */
export interface SetChatAdministratorCustomTitleParams
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
     * New custom title for the administrator; 0-16 characters, emoji are not allowed    
     */
    custom_title: string,
}

/**
 * Use this method to ban a channel chat in a supergroup or a channel. Until the
 * chat is unbanned, the owner of the banned chat won't be able to send messages on
 * behalf of any of their channels. The bot must be an administrator in the
 * supergroup or channel for this to work and must have the appropriate
 * administrator rights. Returns True on success.
 */
export interface BanChatSenderChatParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target sender chat    
     */
    sender_chat_id: number,
}

/**
 * Use this method to unban a previously banned channel chat in a supergroup or
 * channel. The bot must be an administrator for this to work and must have the
 * appropriate administrator rights. Returns True on success.
 */
export interface UnbanChatSenderChatParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Unique identifier of the target sender chat    
     */
    sender_chat_id: number,
}

/**
 * Use this method to set default chat permissions for all members. The bot must be
 * an administrator in the group or a supergroup for this to work and must have the
 * can_restrict_members administrator rights. Returns True on success.
 */
export interface SetChatPermissionsParams
{

    /**
     * Unique identifier for the target chat or username of the target supergroup (in
     * the format @supergroupusername)    
     */
    chat_id: number | string,

    /**
     * A JSON-serialized object for new default chat permissions    
     */
    permissions: ChatPermissions,
}

/**
 * Use this method to generate a new primary invite link for a chat; any previously
 * generated primary link is revoked. The bot must be an administrator in the chat
 * for this to work and must have the appropriate administrator rights. Returns the
 * new invite link as String on success.
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
 * Use this method to create an additional invite link for a chat. The bot must be
 * an administrator in the chat for this to work and must have the appropriate
 * administrator rights. The link can be revoked using the method
 * revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.
 */
export interface CreateChatInviteLinkParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Invite link name; 0-32 characters    
     */
    name?: string,

    /**
     * Point in time (Unix timestamp) when the link will expire    
     */
    expire_date?: number,

    /**
     * Maximum number of users that can be members of the chat simultaneously after
     * joining the chat via this invite link; 1-99999    
     */
    member_limit?: number,

    /**
     * True, if users joining the chat via the link need to be approved by chat
     * administrators. If True, member_limit can't be specified    
     */
    creates_join_request?: boolean,
}

/**
 * Use this method to edit a non-primary invite link created by the bot. The bot
 * must be an administrator in the chat for this to work and must have the
 * appropriate administrator rights. Returns the edited invite link as a
 * ChatInviteLink object.
 */
export interface EditChatInviteLinkParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * The invite link to edit    
     */
    invite_link: string,

    /**
     * Invite link name; 0-32 characters    
     */
    name?: string,

    /**
     * Point in time (Unix timestamp) when the link will expire    
     */
    expire_date?: number,

    /**
     * Maximum number of users that can be members of the chat simultaneously after
     * joining the chat via this invite link; 1-99999    
     */
    member_limit?: number,

    /**
     * True, if users joining the chat via the link need to be approved by chat
     * administrators. If True, member_limit can't be specified    
     */
    creates_join_request?: boolean,
}

/**
 * Use this method to revoke an invite link created by the bot. If the primary link
 * is revoked, a new link is automatically generated. The bot must be an
 * administrator in the chat for this to work and must have the appropriate
 * administrator rights. Returns the revoked invite link as ChatInviteLink object.
 */
export interface RevokeChatInviteLinkParams
{

    /**
     * Unique identifier of the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * The invite link to revoke    
     */
    invite_link: string,
}

/**
 * Use this method to approve a chat join request. The bot must be an administrator
 * in the chat for this to work and must have the can_invite_users administrator
 * right. Returns True on success.
 */
export interface ApproveChatJoinRequestParams
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
}

/**
 * Use this method to decline a chat join request. The bot must be an administrator
 * in the chat for this to work and must have the can_invite_users administrator
 * right. Returns True on success.
 */
export interface DeclineChatJoinRequestParams
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
}

/**
 * Use this method to set a new profile photo for the chat. Photos can't be changed
 * for private chats. The bot must be an administrator in the chat for this to work
 * and must have the appropriate administrator rights. Returns True on success.
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
 * have the appropriate administrator rights. Returns True on success.
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
 * must have the appropriate administrator rights. Returns True on success.
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
 * Use this method to change the description of a group, a supergroup or a channel.
 * The bot must be an administrator in the chat for this to work and must have the
 * appropriate administrator rights. Returns True on success.
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
 * Use this method to add a message to the list of pinned messages in a chat. If
 * the chat is not a private chat, the bot must be an administrator in the chat for
 * this to work and must have the 'can_pin_messages' administrator right in a
 * supergroup or 'can_edit_messages' administrator right in a channel. Returns True
 * on success.
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
     * about the new pinned message. Notifications are always disabled in channels and
     * private chats.    
     */
    disable_notification?: boolean,
}

/**
 * Use this method to remove a message from the list of pinned messages in a chat.
 * If the chat is not a private chat, the bot must be an administrator in the chat
 * for this to work and must have the 'can_pin_messages' administrator right in a
 * supergroup or 'can_edit_messages' administrator right in a channel. Returns True
 * on success.
 */
export interface UnpinChatMessageParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Identifier of a message to unpin. If not specified, the most recent pinned
     * message (by sending date) will be unpinned.    
     */
    message_id?: number,
}

/**
 * Use this method to clear the list of pinned messages in a chat. If the chat is
 * not a private chat, the bot must be an administrator in the chat for this to
 * work and must have the 'can_pin_messages' administrator right in a supergroup or
 * 'can_edit_messages' administrator right in a channel. Returns True on success.
 */
export interface UnpinAllChatMessagesParams
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
export interface GetChatMemberCountParams
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
 * administrator rights. Use the field can_set_sticker_set optionally returned in
 * getChat requests to check if the bot can use this method. Returns True on
 * success.
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
 * administrator rights. Use the field can_set_sticker_set optionally returned in
 * getChat requests to check if the bot can use this method. Returns True on
 * success.
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
     * If True, an alert will be shown by the client instead of a notification at the
     * top of the chat screen. Defaults to false.    
     */
    show_alert?: boolean,

    /**
     * URL that will be opened by the user's client. If you have created a Game and
     * accepted the conditions via @Botfather, specify the URL that opens your game —
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
 * Use this method to change the list of the bot's commands. See
 * https://core.telegram.org/bots#commands for more details about bot commands.
 * Returns True on success.
 */
export interface SetMyCommandsParams
{

    /**
     * A JSON-serialized list of bot commands to be set as the list of the bot's
     * commands. At most 100 commands can be specified.    
     */
    commands: Array<BotCommand>,

    /**
     * A JSON-serialized object, describing scope of users for which the commands are
     * relevant. Defaults to BotCommandScopeDefault.    
     */
    scope?: BotCommandScope,

    /**
     * A two-letter ISO 639-1 language code. If empty, commands will be applied to all
     * users from the given scope, for whose language there are no dedicated commands    
     */
    language_code?: string,
}

/**
 * Use this method to delete the list of the bot's commands for the given scope and
 * user language. After deletion, higher level commands will be shown to affected
 * users. Returns True on success.
 */
export interface DeleteMyCommandsParams
{

    /**
     * A JSON-serialized object, describing scope of users for which the commands are
     * relevant. Defaults to BotCommandScopeDefault.    
     */
    scope?: BotCommandScope,

    /**
     * A two-letter ISO 639-1 language code. If empty, commands will be applied to all
     * users from the given scope, for whose language there are no dedicated commands    
     */
    language_code?: string,
}

/**
 * Use this method to get the current list of the bot's commands for the given
 * scope and user language. Returns Array of BotCommand on success. If commands
 * aren't set, an empty list is returned.
 */
export interface GetMyCommandsParams
{

    /**
     * A JSON-serialized object, describing scope of users. Defaults to
     * BotCommandScopeDefault.    
     */
    scope?: BotCommandScope,

    /**
     * A two-letter ISO 639-1 language code or an empty string    
     */
    language_code?: string,
}

/**
 * Use this method to edit text and game messages. On success, if the edited
 * message is not an inline message, the edited Message is returned, otherwise True
 * is returned.
 */
export interface EditMessageTextParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message to
     * edit    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * New text of the message, 1-4096 characters after entities parsing    
     */
    text: string,

    /**
     * Mode for parsing entities in the message text. See formatting options for more
     * details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in message text, which
     * can be specified instead of parse_mode    
     */
    entities?: Array<MessageEntity>,

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
 * Use this method to edit captions of messages. On success, if the edited message
 * is not an inline message, the edited Message is returned, otherwise True is
 * returned.
 */
export interface EditMessageCaptionParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message to
     * edit    
     */
    message_id?: number,

    /**
     * Required if chat_id and message_id are not specified. Identifier of the inline
     * message    
     */
    inline_message_id?: string,

    /**
     * New caption of the message, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Mode for parsing entities in the message caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * A JSON-serialized list of special entities that appear in the caption, which can
     * be specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

    /**
     * A JSON-serialized object for an inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to edit animation, audio, document, photo, or video messages. If
 * a message is part of a message album, then it can be edited only to an audio for
 * audio albums, only to a document for document albums and to a photo or a video
 * otherwise. When an inline message is edited, a new file can't be uploaded; use a
 * previously uploaded file via its file_id or specify a URL. On success, if the
 * edited message is not an inline message, the edited Message is returned,
 * otherwise True is returned.
 */
export interface EditMessageMediaParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message to
     * edit    
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
 * Use this method to edit only the reply markup of messages. On success, if the
 * edited message is not an inline message, the edited Message is returned,
 * otherwise True is returned.
 */
export interface EditMessageReplyMarkupParams
{

    /**
     * Required if inline_message_id is not specified. Unique identifier for the target
     * chat or username of the target channel (in the format @channelusername)    
     */
    chat_id?: number | string,

    /**
     * Required if inline_message_id is not specified. Identifier of the message to
     * edit    
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
 * Use this method to stop a poll which was sent by the bot. On success, the
 * stopped Poll is returned.
 */
export interface StopPollParams
{

    /**
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

    /**
     * Identifier of the original message with the poll    
     */
    message_id: number,

    /**
     * A JSON-serialized object for a new message inline keyboard.    
     */
    reply_markup?: InlineKeyboardMarkup,
}

/**
 * Use this method to delete a message, including service messages, with the
 * following limitations: - A message can only be deleted if it was sent less than
 * 48 hours ago. - A dice message in a private chat can only be deleted if it was
 * sent more than 24 hours ago. - Bots can delete outgoing messages in private
 * chats, groups, and supergroups. - Bots can delete incoming messages in private
 * chats. - Bots granted can_post_messages permissions can delete outgoing messages
 * in channels. - If the bot is an administrator of a group, it can delete any
 * message there. - If the bot has can_delete_messages permission in a supergroup
 * or a channel, it can delete any message there. Returns True on success.
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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

    /**
     * Sticker width    
     */
    width: number,

    /**
     * Sticker height    
     */
    height: number,

    /**
     * True, if the sticker is animated    
     */
    is_animated: boolean,

    /**
     * Optional. Sticker thumbnail in the .WEBP or .JPG format    
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
     * Optional. File size in bytes    
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
     * True, if the sticker set contains animated stickers    
     */
    is_animated: boolean,

    /**
     * True, if the sticker set contains masks    
     */
    contains_masks: boolean,

    /**
     * List of all set stickers    
     */
    stickers: Array<Sticker>,

    /**
     * Optional. Sticker set thumbnail in the .WEBP or .TGS format    
     */
    thumb?: PhotoSize,
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
 * Use this method to send static .WEBP or animated .TGS stickers. On success, the
 * sent Message is returned.
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
     * a .WEBP file from the Internet, or upload a new one using multipart/form-data.
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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
 * Use this method to upload a .PNG file with a sticker for later use in
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
     * PNG image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. More info on
     * Sending Files »    
     */
    png_sticker: { name: string, data: Buffer },
}

/**
 * Use this method to create a new sticker set owned by a user. The bot will be
 * able to edit the sticker set thus created. You must use exactly one of the
 * fields png_sticker or tgs_sticker. Returns True on success.
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
     * PNG image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. Pass a
     * file_id as a String to send a file that already exists on the Telegram servers,
     * pass an HTTP URL as a String for Telegram to get a file from the Internet, or
     * upload a new one using multipart/form-data. More info on Sending Files »    
     */
    png_sticker?: { name: string, data: Buffer } | string,

    /**
     * TGS animation with the sticker, uploaded using multipart/form-data. See
     * https://core.telegram.org/animated_stickers#technical-requirements for technical
     * requirements    
     */
    tgs_sticker?: { name: string, data: Buffer },

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
 * Use this method to add a new sticker to a set created by the bot. You must use
 * exactly one of the fields png_sticker or tgs_sticker. Animated stickers can be
 * added to animated sticker sets and only to them. Animated sticker sets can have
 * up to 50 stickers. Static sticker sets can have up to 120 stickers. Returns True
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
     * PNG image with the sticker, must be up to 512 kilobytes in size, dimensions must
     * not exceed 512px, and either width or height must be exactly 512px. Pass a
     * file_id as a String to send a file that already exists on the Telegram servers,
     * pass an HTTP URL as a String for Telegram to get a file from the Internet, or
     * upload a new one using multipart/form-data. More info on Sending Files »    
     */
    png_sticker?: { name: string, data: Buffer } | string,

    /**
     * TGS animation with the sticker, uploaded using multipart/form-data. See
     * https://core.telegram.org/animated_stickers#technical-requirements for technical
     * requirements    
     */
    tgs_sticker?: { name: string, data: Buffer },

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
 * position. Returns True on success.
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
 * Use this method to set the thumbnail of a sticker set. Animated thumbnails can
 * be set for animated sticker sets only. Returns True on success.
 */
export interface SetStickerSetThumbParams
{

    /**
     * Sticker set name    
     */
    name: string,

    /**
     * User identifier of the sticker set owner    
     */
    user_id: number,

    /**
     * A PNG image with the thumbnail, must be up to 128 kilobytes in size and have
     * width and height exactly 100px, or a TGS animation with the thumbnail up to 32
     * kilobytes in size; see
     * https://core.telegram.org/animated_stickers#technical-requirements for animated
     * sticker technical requirements. Pass a file_id as a String to send a file that
     * already exists on the Telegram servers, pass an HTTP URL as a String for
     * Telegram to get a file from the Internet, or upload a new one using
     * multipart/form-data. More info on Sending Files ». Animated sticker set
     * thumbnail can't be uploaded via HTTP URL.    
     */
    thumb?: { name: string, data: Buffer } | string,
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
     * Text of the query (up to 256 characters)    
     */
    query: string,

    /**
     * Offset of the results to be returned, can be controlled by the bot    
     */
    offset: string,

    /**
     * Optional. Type of the chat, from which the inline query was sent. Can be either
     * “sender” for a private chat with the inline query sender, “private”, “group”,
     * “supergroup”, or “channel”. The chat type should be always known for requests
     * sent from official clients and most third-party clients, unless the request was
     * sent from a secret chat    
     */
    chat_type?: string,

    /**
     * Optional. Sender location, only for bots that request user location    
     */
    location?: Location,
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
     * you don't support pagination. Offset length can't exceed 64 bytes.    
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
     * displays a 'Connect your YouTube account' button above the results, or even
     * before showing any. The user presses the button, switches to a private chat with
     * the bot and, in doing so, passes a start parameter that instructs the bot to
     * return an OAuth link. Once done, the bot can offer a switch_inline button so
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
     * A valid URL of the photo. Photo must be in JPEG format. Photo size must not
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
     * Optional. Caption of the photo to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the photo caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Duration of the GIF in seconds    
     */
    gif_duration?: number,

    /**
     * URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result    
     */
    thumb_url: string,

    /**
     * Optional. MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”,
     * or “video/mp4”. Defaults to “image/jpeg”    
     */
    thumb_mime_type?: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the GIF file to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Video duration in seconds    
     */
    mpeg4_duration?: number,

    /**
     * URL of the static (JPEG or GIF) or animated (MPEG4) thumbnail for the result    
     */
    thumb_url: string,

    /**
     * Optional. MIME type of the thumbnail, must be one of “image/jpeg”, “image/gif”,
     * or “video/mp4”. Defaults to “image/jpeg”    
     */
    thumb_mime_type?: string,

    /**
     * Optional. Title for the result    
     */
    title?: string,

    /**
     * Optional. Caption of the MPEG-4 file to be sent, 0-1024 characters after
     * entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * URL of the thumbnail (JPEG only) for the video    
     */
    thumb_url: string,

    /**
     * Title for the result    
     */
    title: string,

    /**
     * Optional. Caption of the video to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the video caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
 * Represents a link to an MP3 audio file. By default, this audio file will be sent
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
     * Optional. Caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the audio caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
 * Represents a link to a voice recording in an .OGG container encoded with OPUS.
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
     * Optional. Caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the voice message caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption of the document to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the document caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. URL of the thumbnail (JPEG only) for the file    
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
     * Optional. The radius of uncertainty for the location, measured in meters; 0-1500    
     */
    horizontal_accuracy?: any,

    /**
     * Optional. Period in seconds for which the location can be updated, should be
     * between 60 and 86400.    
     */
    live_period?: number,

    /**
     * Optional. For live locations, a direction in which the user is moving, in
     * degrees. Must be between 1 and 360 if specified.    
     */
    heading?: number,

    /**
     * Optional. For live locations, a maximum distance for proximity alerts about
     * approaching another chat member, in meters. Must be between 1 and 100000 if
     * specified.    
     */
    proximity_alert_radius?: number,

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
     * Optional. Google Places identifier of the venue    
     */
    google_place_id?: string,

    /**
     * Optional. Google Places type of the venue. (See supported types.)    
     */
    google_place_type?: string,

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
     * Optional. Caption of the photo to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the photo caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption of the GIF file to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption of the MPEG-4 file to be sent, 0-1024 characters after
     * entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the caption. See formatting options for
     * more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption of the document to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the document caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption of the video to be sent, 0-1024 characters after entities
     * parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the video caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the voice message caption. See formatting
     * options for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
 * Represents a link to an MP3 audio file stored on the Telegram servers. By
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
     * Optional. Caption, 0-1024 characters after entities parsing    
     */
    caption?: string,

    /**
     * Optional. Mode for parsing entities in the audio caption. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in the caption, which can be
     * specified instead of parse_mode    
     */
    caption_entities?: Array<MessageEntity>,

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
     * Optional. Mode for parsing entities in the message text. See formatting options
     * for more details.    
     */
    parse_mode?: string,

    /**
     * Optional. List of special entities that appear in message text, which can be
     * specified instead of parse_mode    
     */
    entities?: Array<MessageEntity>,

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
     * Optional. The radius of uncertainty for the location, measured in meters; 0-1500    
     */
    horizontal_accuracy?: any,

    /**
     * Optional. Period in seconds for which the location can be updated, should be
     * between 60 and 86400.    
     */
    live_period?: number,

    /**
     * Optional. For live locations, a direction in which the user is moving, in
     * degrees. Must be between 1 and 360 if specified.    
     */
    heading?: number,

    /**
     * Optional. For live locations, a maximum distance for proximity alerts about
     * approaching another chat member, in meters. Must be between 1 and 100000 if
     * specified.    
     */
    proximity_alert_radius?: number,
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

    /**
     * Optional. Google Places identifier of the venue    
     */
    google_place_id?: string,

    /**
     * Optional. Google Places type of the venue. (See supported types.)    
     */
    google_place_type?: string,
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
 * Represents the content of an invoice message to be sent as the result of an
 * inline query.
 */
export interface InputInvoiceMessageContent extends InputMessageContent
{

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
     * Payment provider token, obtained via Botfather    
     */
    provider_token: string,

    /**
     * Three-letter ISO 4217 currency code, see more on currencies    
     */
    currency: string,

    /**
     * Price breakdown, a JSON-serialized list of components (e.g. product price, tax,
     * discount, delivery cost, delivery tax, bonus, etc.)    
     */
    prices: Array<LabeledPrice>,

    /**
     * Optional. The maximum accepted amount for tips in the smallest units of the
     * currency (integer, not float/double). For example, for a maximum tip of US$ 1.45
     * pass max_tip_amount = 145. See the exp parameter in currencies.json, it shows
     * the number of digits past the decimal point for each currency (2 for the
     * majority of currencies). Defaults to 0    
     */
    max_tip_amount?: number,

    /**
     * Optional. A JSON-serialized array of suggested amounts of tip in the smallest
     * units of the currency (integer, not float/double). At most 4 suggested tip
     * amounts can be specified. The suggested tip amounts must be positive, passed in
     * a strictly increased order and must not exceed max_tip_amount.    
     */
    suggested_tip_amounts?: Array<number>,

    /**
     * Optional. A JSON-serialized object for data about the invoice, which will be
     * shared with the payment provider. A detailed description of the required fields
     * should be provided by the payment provider.    
     */
    provider_data?: string,

    /**
     * Optional. URL of the product photo for the invoice. Can be a photo of the goods
     * or a marketing image for a service. People like it better when they see what
     * they are paying for.    
     */
    photo_url?: string,

    /**
     * Optional. Photo size    
     */
    photo_size?: number,

    /**
     * Optional. Photo width    
     */
    photo_width?: number,

    /**
     * Optional. Photo height    
     */
    photo_height?: number,

    /**
     * Optional. Pass True, if you require the user's full name to complete the order    
     */
    need_name?: boolean,

    /**
     * Optional. Pass True, if you require the user's phone number to complete the
     * order    
     */
    need_phone_number?: boolean,

    /**
     * Optional. Pass True, if you require the user's email address to complete the
     * order    
     */
    need_email?: boolean,

    /**
     * Optional. Pass True, if you require the user's shipping address to complete the
     * order    
     */
    need_shipping_address?: boolean,

    /**
     * Optional. Pass True, if user's phone number should be sent to provider    
     */
    send_phone_number_to_provider?: boolean,

    /**
     * Optional. Pass True, if user's email address should be sent to provider    
     */
    send_email_to_provider?: boolean,

    /**
     * Optional. Pass True, if the final price depends on the shipping method    
     */
    is_flexible?: boolean,
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
     * Unique identifier for the target chat or username of the target channel (in the
     * format @channelusername)    
     */
    chat_id: number | string,

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
     * Three-letter ISO 4217 currency code, see more on currencies    
     */
    currency: string,

    /**
     * Price breakdown, a JSON-serialized list of components (e.g. product price, tax,
     * discount, delivery cost, delivery tax, bonus, etc.)    
     */
    prices: Array<LabeledPrice>,

    /**
     * The maximum accepted amount for tips in the smallest units of the currency
     * (integer, not float/double). For example, for a maximum tip of US$ 1.45 pass
     * max_tip_amount = 145. See the exp parameter in currencies.json, it shows the
     * number of digits past the decimal point for each currency (2 for the majority of
     * currencies). Defaults to 0    
     */
    max_tip_amount?: number,

    /**
     * A JSON-serialized array of suggested amounts of tips in the smallest units of
     * the currency (integer, not float/double). At most 4 suggested tip amounts can be
     * specified. The suggested tip amounts must be positive, passed in a strictly
     * increased order and must not exceed max_tip_amount.    
     */
    suggested_tip_amounts?: Array<number>,

    /**
     * Unique deep-linking parameter. If left empty, forwarded copies of the sent
     * message will have a Pay button, allowing multiple users to pay directly from the
     * forwarded message, using the same invoice. If non-empty, forwarded copies of the
     * sent message will have a URL button with a deep link to the bot (instead of a
     * Pay button), with the value used as the start parameter    
     */
    start_parameter?: string,

    /**
     * A JSON-serialized data about the invoice, which will be shared with the payment
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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

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
     * Identifier for this file, which can be used to download or reuse the file    
     */
    file_id: string,

    /**
     * Unique identifier for this file, which is supposed to be the same over time and
     * for different bots. Can't be used to download or reuse the file.    
     */
    file_unique_id: string,

    /**
     * File size in bytes    
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
     * Pass True, if the message should be sent even if the specified replied-to
     * message is not found    
     */
    allow_sending_without_reply?: boolean,

    /**
     * A JSON-serialized object for an inline keyboard. If empty, one 'Play game_title'
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
 * Use this method to set the score of the specified user in a game message. On
 * success, if the message is not an inline message, the Message is returned,
 * otherwise True is returned. Returns an error, if the new score is not greater
 * than the user's current score in the chat and force is False.
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
 * specified user and several of their neighbors in a game. On success, returns an
 * Array of GameHighScore objects.This method will currently return scores for the
 * target user, plus two of their closest neighbors on each side. Will also return
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

/**
 * This object contains information about one member of a chat. Currently, the
 * following 6 types of chat members are supported.
 */
export interface ChatMember
{

}

/**
 * This object represents a service message about a voice chat started in the chat.
 * Currently holds no information.
 */
export interface VoiceChatStarted
{

}

/**
 * This object represents the scope to which bot commands are applied.
 */
export interface BotCommandScope
{

}
