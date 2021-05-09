const axios = require('axios');
const { sendTaskToSqs } = require('./queue');
const EventEmitter = require('events')
EventEmitter.prototype._maxListeners = 100;
const endCrawlEvent = new EventEmitter();
const redisClient = require('../../db/redis');

const tasks = {};
const workers = ['http://localhost:3030/start-crawling'];



const createTsk = (id, maxPages, maxDepth) => {
    tasks[id] = {
        maxPages: parseInt(maxPages),
        maxDepth: parseInt(maxDepth),
        crawledPages: {},
        numOfPagesSentToCrawler: 1,
        pagesInNextLayer: [],
        currentDepth: 0
    }
}



const isTaskCompleted = (task) => {
    return Object.keys(task.crawledPages).length >= task.maxPages
        || task.currentDepth >= task.maxDepth
        || Object.keys(task.pagesInNextLayer).length === 0;
}


const crawlNextLayer = async (task, taskId) => {
    const newUrls = task.pagesInNextLayer.filter((url) => task.crawledPages[url] === undefined)
    task.pagesInNextLayer = newUrls;
    task.pagesInNextLayer.length = Math.min(task.pagesInNextLayer.length, task.maxPages - Object.keys(task.crawledPages).length);
    task.numOfPagesSentToCrawler += task.pagesInNextLayer.length;
    if (isTaskCompleted(task)) {
        return endCrawlEvent.emit('endCrawling', { taskId, data: { endTask: true } });
    }
    task.currentDepth++;
    sendUrlsToCrawler(task.pagesInNextLayer, taskId);
}


const sendUrlsToCrawler = async (urls, taskId) => {
    urls.forEach(async (url) => {
        const redisCache = await getPageFromRedis(url);
        if (redisCache) {
            controlTasks({ url, ...redisCache }, taskId)
        } else {
            sendTaskToSqs(url, taskId)
        }
    })
}




const controlTasks = async (page, taskId) => {
    const currentTask = tasks[taskId];
    currentTask.crawledPages[page.url] = { title: page.title, links: page.links, depth: currentTask.currentDepth };
    sendPageToRedis(page.url, { links: page.links, title: page.title })
    currentTask.pagesInNextLayer.push(...page.links);
    endCrawlEvent.emit('endCrawling', { taskId, data: { ...page, depth: currentTask.currentDepth } });

    // checks whether all pages at current depth have been crawled by checking if all tasks sent to sqs have returned
    if (Object.keys(currentTask.crawledPages).length === currentTask.numOfPagesSentToCrawler) {
        crawlNextLayer(currentTask, taskId);
    }
}



const startWorkers = () => {
    workers.forEach(async (workerUrl) => {
        try {
            await axios.get(workerUrl);
        } catch (err) {
            console.log(err);
        }
    })
}



const getPageFromRedis = async (url) => {
    try {
        return JSON.parse(await redisClient.getAsync("search:" + url));
    } catch (err) {
        console.log(err);
    }
}


const sendPageToRedis = async (url, data) => {
    redisClient.setexAsync(
        "search:" + url,
        60 * 20,
        JSON.stringify(data)
    );
}

module.exports = { startWorkers, createTsk, controlTasks, endCrawlEvent, sendUrlsToCrawler }

