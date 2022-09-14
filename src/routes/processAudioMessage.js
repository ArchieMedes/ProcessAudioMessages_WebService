const { Router } = require('express');
const router = Router();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
    let getFunction = { "webService": "processAudioMessage"};
    res.json(getFunction);
});

router.post('/', async (req, res) => {
    console.log('Llamada POST a servicio processAudioMessage')
    const { VoiceMessageUrl, ConversationMessageId, ContactPhoneNumber, AudioLenghtExceeded } = req.body;

    const AUDIOLENGTH_EXCEEDED = AudioLenghtExceeded;
    const url = VoiceMessageUrl;
    // we get the audio by consuming api rest from messagebird to get the audio from a blobstorage with a url link within the message req
    let config = {
        url,
        method: 'GET',
        responseType: 'stream'
    };

    await axios ( config )
    .then( async ( axiosResponse ) => {
        console.log("Logramos obtener el audio desde la API de messagebird");
        // We write the axiosResponse.data content with the writer from writeSream we created before
        // console.log("axiosResponse después de AXIOS:", axiosResponse);
        let responseContentLength = axiosResponse.headers['content-length'];
        console.log( 'Content Length mensaje de ENTRADA:', responseContentLength );

        if( responseContentLength > 77000 ){
            console.log( 'AUDIO MAYOR A 30 SEGUNDOS:', responseContentLength );

            let response = {
                "response" : {
                    "code": 01,
                    "message": "Audio mayor a 30 segundos",
                    "messageResponse": AUDIOLENGTH_EXCEEDED
                }
            };

            res.send(response);
            // return AUDIOLENGTH_EXCEEDED;

        } else {
            console.log('AUDIO MENOR A 30 SEGUNDOS');
            //File Name Definition
            const filePath = path.resolve('./whatsapp_media/', 'audio' + ConversationMessageId + ContactPhoneNumber + '.ogg')
            const writer = fs.createWriteStream(filePath);
            // WRITING OF THE LOCAL FILE
            axiosResponse.data.pipe(writer);
            await axiosResponse.data.on('end', async () => {
                console.log("Ya terminó de ESCRIBIR el audio en el archivo");
                return true;
            });
            
            let response = {
                "response" : {
                    "code": 00,
                    "message": "Audio menor a 30 segundos",
                    "messageResponse": true
                }
            };

            res.send(response);
            // return true;
        }    
    }). catch( ( error ) => {
        console.log('Falló al obtener el audio:', error);
        let response = {
            "response" : {
                "code": 02,
                "message": "Error al obtener el audio",
                "messageResponse": false
            }
        };

        res.send(response);
        // return AUDIOLENGTH_EXCEEDED;
        
    });
})


module.exports = router;