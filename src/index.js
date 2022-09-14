const express = require('express');
const morgan = require('morgan');
// application
const app = express();

// settings
app.set('port', process.env.PORT || process.env.port || 3001 );
app.set('json spaces', 2); // para mostrar los formatos JSON espaciados por saltos de linea

// middlewares
app.use(morgan('dev'));
app.use(express.json()); // para soportar formatos json por partede mi servidor

// ROUTES
app.use(require('./routes/index')); // http://localhost:3001/test
app.use('/api/processAudioMessage', require('./routes/processAudioMessage')); // http://localhost:3001/api/processAudioMessage
app.use('/api/convertAudioToText', require('./routes/convertAudioToText')); // http://localhost:3001/api/convertAudioToText
app.use('/api/convertTextToAudio', require('./routes/convertTextToAudio')); // http://localhost:3001/api/convertTextToAudio
app.use('/api/uploadAudioMessage', require('./routes/uploadAudioMessage')); // http://localhost:3001/api/uploadAudioMessage
app.use('/api/deleteAudioMessage', require('./routes/deleteAudioMessage')); // http://localhost:3001/api/deleteAudioMessage

// starting server
app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});