
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

    /** METHODS **/
}

/** INTERFACES **/