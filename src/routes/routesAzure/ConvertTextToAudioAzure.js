const axios = require('axios');
const fs = require('fs');

module.exports = async function (context, req) {
    console.log('Llamada POST a servicio convertTextToAudio');
    const { ConversationMessageId, ContactPhoneNumber, TtsHost, SpeechServiceKey, FemaleVoice, BotReply } = req.body;

    const femaleVoice = FemaleVoice;
    const urlTTS = TtsHost;
    const text = BotReply;
    const speechServiceKey = SpeechServiceKey;
    const conversationMessageId = ConversationMessageId;
    const contactPhoneNumber = ContactPhoneNumber;
    let voiceName, voiceGender, voiceLanguage;
    
    if( femaleVoice ){
        voiceName = 'es-MX-DaliaNeural';
        voiceLanguage = 'es-MX';
        voiceGender = 'Female';
    } else {
        voiceName = 'es-MX-JorgeNeural';
        voiceLanguage = 'es-MX'; 
        voiceGender = 'Male';        
    }
     
    const body = `<speak version=\'1.0\' xml:lang=\'es-MX\'>
                    <voice xml:lang=\'${voiceLanguage}\' xml:gender=\'${voiceGender}\'\r\n    
                    name=\'${voiceName}\'>\r\n        
                           ${text}\r\n
                    </voice>
                  </speak>`;              
            
    let config = {
        'method': 'post',
        'responseType': 'stream',
        'url': urlTTS,
        'headers': {
            'Ocp-Apim-Subscription-Key': speechServiceKey,
            'Content-Type' : 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'ogg-24khz-16bit-mono-opus',
            'User-Agent': 'curl'
        },
        'data': body
    };
    
    
    await axios( config )
    .then(async function (ttsResponse) {
        console.log('Logramos obtener el archivo de TEXTO a AUDIO');
        //File Name Definition
        const path = './whatsapp_media/' + conversationMessageId + contactPhoneNumber + 'Response.ogg';    
        let file = fs.createWriteStream(path);
        // WRITING OF THE LOCAL FILE
        ttsResponse.data.pipe( file );
        await ttsResponse.data.on('end', async () => {
            console.log("ya terminó de escribir el archivo en el file system");
            return true;
        });

        /*let response = {
            "response" : {
                "code": 00,
                "message": "Texto convertido a audio exitosamente",
                "messageResponse": true
            }
        };

        res.send(response);*/
        
        context.res = {
            body: { 
                response : {
                    "code": 00,
                    "message": "Texto convertido a audio exitosamente",
                    "messageResponse": true
                }
            }
        };
    	
    })
    .catch(function (error) {
        console.log('Falló al obtener el audio:', error);
        
        /*let response = {
            "response" : {
                "code": 01,
                "message": "Error al convertir el audio a texto",
                "messageResponse": false
            }
        };

        res.send(response);*/
        
        context.res = {
            body: { 
                response : {
                    "code": 01,
                    "message": "Error al convertir el audio a texto",
                    "messageResponse": false
                }
            }
        };
    });
}