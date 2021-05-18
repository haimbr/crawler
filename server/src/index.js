
const app = require('./app');
const http = require('http');
const initiateSocketIo = require('./socketio');


const port = process.env.PORT;
const server = http.createServer(app);
initiateSocketIo(server);

server.listen(port, () => console.log('listening on port' + port));


