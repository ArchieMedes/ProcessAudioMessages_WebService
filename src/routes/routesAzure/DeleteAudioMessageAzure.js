const axios = require('axios');
const fs = require('fs');

module.exports = async function (context, req) {
    console.log('Llamada POST a servicio deleteAudioMessage');
    const { ConversationMessageId, ContactPhoneNumber, AzureResources } = req.body;
    const conversationMessageId = ConversationMessageId;
    const contactPhoneNumber = ContactPhoneNumber;
    
    // deleting local audio
    fs.unlink("./whatsapp_media/" + conversationMessageId + contactPhoneNumber + 'Response.ogg', function (err) {
        if( err ){
            console.log("err while deleting file:", err);

            /*let response = {
                "response" : {
                    "code": 01,
                    "message": "ERROR al BORRAR archivo en LOCAL",
                    "messageResponse": false
                }
            };

            res.send(response); */
            
            context.res = {
                body: {
                    response: {
                        "code": 01,
                        "message": "ERROR al BORRAR archivo en LOCAL",
                        "messageResponse": false
                    }
                }
            };

            throw err;
        } else {
            console.log("exito al borrar archivo LOCAL");
        }
    });
    // deleting blob storage audio
    const url = AzureResources.UPLOADFILES_HOST + 'deleteFile';
    const body = {
        "name": conversationMessageId + contactPhoneNumber + 'Response.ogg'
    };
    
    //Define headers with the access key
    const headers = {
		'Content-Type': 'application/json',
		'Authorization': AzureResources.CORE_RESOURCE_SERVICE_KEY
	}
    
    console.log('Vamos a borrar el archivo del BLOB');
    
    return await axios.post( url, body, { headers: headers } )
    .then(function (axiosResponse) {
        console.log( "exito al BORRAR archivo en BLOB. response.data.code:", axiosResponse.data.code );
        // return response.data.code;   
        /*let response = {
            "response" : {
                "code": 00,
                "message": "Exito al BORRAR archivo en BLOB",
                "messageResponse": true
            }
        };

        res.send(response);*/
        
        context.res = {
            body: {
                response: {
                    "code": 00,
                    "message": "Exito al BORRAR archivo en BLOB",
                    "messageResponse": true
                }
            }
        };
                
    })
    .catch(function (error) {
        console.log(error.response);
        // return false;
        /*let response = {
            "response" : {
                "code": 02,
                "message": "ERROR al BORRAR archivo en BLOB",
                "messageResponse": false
            }
        };

        res.send(response); */
        
        context.res = {
            body: {
                response: {
                    "code": 02,
                    "message": "ERROR al BORRAR archivo en BLOB",
                    "messageResponse": false
                }
            }
        };
    });
}