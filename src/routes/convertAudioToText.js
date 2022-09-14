const { Router } = require('express');
const router = Router();
const axios = require('axios');
const fs = require('fs');

router.get('/', (req, res) => {
    let getFunction = { "webService": "convertAudioToText"};
    res.json(getFunction);
});

router.post('/', async (req, res) => {
    console.log('Llamada POST a servicio convertAudioToText')
    const { ConversationMessageId, ContactPhoneNumber, AzureResources, AudioLenghtExceeded } = req.body;

    const AUDIOLENGTH_EXCEEDED = AudioLenghtExceeded;
    const conversationMessageId = ConversationMessageId;
    const contactPhoneNumber = ContactPhoneNumber;
    let message;
    let sttEndpoint =  AzureResources.STT_HOST;
    let readStream = fs.createReadStream('./whatsapp_media/' + 'audio' + conversationMessageId + contactPhoneNumber + '.ogg');
    let headers = {
		'Content-Type': 'audio/ogg',
		'Ocp-Apim-Subscription-Key': AzureResources.SPEECHSERVICE_KEY
	}

    const sttAnswer = await axios.post(sttEndpoint, readStream, { headers: headers } ).catch( function (error) {
        if( error) {
            console.log("error:",error);
            return false;
        }
    });

    // console.log("sttAnswer:", sttAnswer);
    if( sttAnswer ){
        // erasing local audio message
        fs.unlink("./whatsapp_media/" + 'audio' + conversationMessageId + contactPhoneNumber + '.ogg', function (err) {
            if( err ){
                console.log("err while deleting file:", err);
                
                let response = {
                    "response" : {
                        "code": 01,
                        "message": "Audio convertido a texto pero hubo un error al borrar el archivo local del audio",
                        "messageResponse": null
                    }
                };
        
                res.send(response);

                throw err;

            } else {
                console.log("exito al borrar archivo LOCAL");
            }
        });
        // cut off the last character (.) of the message recognized by stt
        message = await sttAnswer.data.DisplayText.slice(0, -1);
        console.log("message después de stt:", message);
        let lastIndex = message.length;
        console.log("lastIndex después de procesar audio:", lastIndex);
        if( message[lastIndex - 1] === "." ){
            message = message.slice(0, -1);
            console.log("ultimo caracter es un punto, lo voy a borrar...:", message);
            // return message;
        } else {
            console.log("devolviendo el mensaje convertido a texto:", message);
            // return message;
        }

        let response = {
            "response" : {
                "code": 00,
                "message": "Audio convertido a texto exitosamente",
                "messageResponse": message
            }
        };

        res.send(response);

    } else {

        let response = {
            "response" : {
                "code": 02,
                "message": "Audio SIN CONVERTIR a texto. ERROR",
                "messageResponse": AUDIOLENGTH_EXCEEDED
            }
        };

        res.send(response);
        
    }
})


module.exports = router;