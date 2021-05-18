const axios = require('axios');
const cheerio = require('cheerio');
const { getTasksFromSqs, deleteTasksFromSqs } = require('./sqs')


let isWorkerRunning = false;

const sendResultsToServer = async (attributes, url, pageData) => {
    const URL = 'http://localhost:3000/crawled-pages';
    
    try {
        await axios.post(URL, {
            taskId: attributes.taskId.StringValue,
            position: attributes.positionInCurrentDepth.StringValue,
            data: { url, ...pageData }
        })
    } catch (err) {
        console.log(err);
    }
}




const crawlDate = async (URL) => {
    try {
        const res = await axios.get(encodeURI(URL));
        const $ = cheerio.load(res.data);
        let links = [];
        $('a').each((index, element) => {
            links.push($(element).attr('href'));
        });
        links = [...new Set(links.filter(link => link !== undefined && link.includes('http')))];
        const title = $('title').text();
        return { links, title };
    } catch (err) {
        console.log('err');//*
        return { links: [], title: 'broken link' };
    }
}



const startCrawling = async () => {
    isWorkerRunning = true;
    let tasks = await getTasksFromSqs();
    if (tasks.length === 0) {
        tasks = await getTasksFromSqs();
        if (tasks.length === 0) {
            return isWorkerRunning = false;
        };
    }

    for (let i = 0; i < tasks.length; i++) {
        let result = await crawlDate(tasks[i].Body);
        sendResultsToServer(tasks[i].MessageAttributes, tasks[i].Body, result);
        deleteTasksFromSqs(tasks[i])
    }
    startCrawling();
}




module.exports = { startCrawling , isWorkerRunning };