const axios = require('axios');
const fs = require('fs');

module.exports = async function (context, req) {
    console.log('Llamada POST a servicio uploadAudioMessage');
    const { ConversationMessageId, ContactPhoneNumber, AzureResources } = req.body;
    const conversationMessageId = ConversationMessageId;
    const contactPhoneNumber = ContactPhoneNumber;
    //Define headers with the access key
    const headers = {
		'Content-Type': 'application/json',
		'Authorization': AzureResources.CORE_RESOURCE_SERVICE_KEY
	};
    //File reading
    let dataFile = fs.readFileSync( "./whatsapp_media/" + conversationMessageId + contactPhoneNumber + "Response.ogg" );
    console.log( 'dataFile:', dataFile );
	let stats = (await fs.promises.stat( "./whatsapp_media/" + conversationMessageId + contactPhoneNumber + "Response.ogg" )).size;
    console.log( 'Content Length mensaje de SALIDA:', stats );
    //File convertion
    var file64Base = Buffer.from( dataFile ).toString('base64');
    const url = AzureResources.UPLOADFILES_HOST + 'uploadFile';	  
    const body = {
    	"name": conversationMessageId + contactPhoneNumber + 'Response.ogg',
    	"body": file64Base,
    	"type": "audio/ogg",
    	"length": stats
    };

    console.log('Vamos a subir el audio al BLOB:');
    
    return await axios.post( url, body, { headers: headers } )
    .then( async function (axiosResponse) {
    	console.log( "exito al SUBIR archivo en BLOB. axiosResponse.data:", axiosResponse.data);
        
        /*let response = {
            "response" : {
                "code": 00,
                "message": "Exito al SUBIR archivo en BLOB",
                "messageResponse": axiosResponse.data.imageURL
            }
        };

        res.send(response);*/

        // return response.data.imageURL; 
        
        context.res = {
            body: {
                response: {
                    "code": 00,
                    "message": "Exito al SUBIR archivo en BLOB",
                       "messageResponse": axiosResponse.data.imageURL
                }
            }
        };       

    })
    .catch(function (error) {
    	console.log("error al subir archivo en BLOB:", error.response);

        /*let response = {
            "response" : {
                "code": 01,
                "message": "Errpr al SUBIR archivo en BLOB",
                "messageResponse": false
            }
        };

        res.send(response);*/
    	
        // return false;
        
        context.res = {
            body: {
                response: {
                    "code": 01,
                    "message": "Errpr al SUBIR archivo en BLOB",
                    "messageResponse": false
                }
            }
        };  
    });
}