const socketIo = require('socket.io');
const { createTask, CrawlerEvent, sendUrlsToCrawler } = require('./utils/crawler-tasks');
const startWorkers = require('./utils/workers');

const initiateSocketIo = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        CrawlerEvent.on('crawler-event', result => {
            if (result.taskId === socket.id) {
                socket.emit(result.eventType, result.data);
            }
        });


        socket.on('start-crawling', (result) => {
            createTask(socket.id, result.maxPages, result.maxDepth);
            sendUrlsToCrawler([result.pageUrl], socket.id);
            startWorkers();
        });
    });
}

module.exports = initiateSocketIo;