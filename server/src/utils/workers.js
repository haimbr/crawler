const axios = require('axios');


const workers = ['http://localhost:3030/start-crawling'];


const startWorkers = () => {
    workers.forEach(async (workerUrl) => {
        try {
            await axios.get(workerUrl);
        } catch (err) {
            console.log(err);
        }
    })
}


module.exports = startWorkers;