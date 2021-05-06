const axios = require('axios');
const { sendTaskToSqs } = require('./queue');
const EventEmitter = require('events')
EventEmitter.prototype._maxListeners = 100;
const endCrawlEvent = new EventEmitter();

const tasks = {};
const redisCache = {};
const workers = ['http://localhost:3030/start-crawling'];




const createTsk = (id, maxPages, maxDepth) => {
    console.log('Creating task')
    tasks[id] = {
        maxPages: parseInt(maxPages),
        maxDepth: parseInt(maxDepth),
        crawledPages: {},
        numOfPagesSentToCrawler: 1,
        pagesInNextLevel: [],
        currentDepth: 0
    }
}


const isTaskCompleted = (task) => {
    return Object.keys(task.crawledPages).length === task.maxPages
        || task.currentDepth === task.maxDepth
        || Object.keys(task.pagesInNextLevel).length === 0;
}

const crawlNextLevel = (task, taskId) => {
    const newUrls = task.pagesInNextLevel.filter((url) => task.crawledPages[url] === undefined)
    task.pagesInNextLevel = newUrls;
    task.pagesInNextLevel.length = Math.min(task.pagesInNextLevel.length, task.maxPages - Object.keys(task.crawledPages).length);
    task.numOfPagesSentToCrawler += task.pagesInNextLevel.length;
    task.currentDepth++;
    if (isTaskCompleted(task)) {
        endCrawlEvent.emit('endCrawling',{ taskId, task });
        return console.log('done end');
    }
    sendLinksToCrawler(task, taskId);
}


const sendLinksToCrawler = (task, taskId) => {

    task.pagesInNextLevel.forEach((link, index) => {
        if (redisCache[link] !== undefined) {
            console.log('cache')
            controlTasks({ url: link, ...redisCache[link] }, taskId)
        } else {
            console.log('sqs')
            sendTaskToSqs(link, taskId)
        }
    })
}




const controlTasks = (page, taskId) => {
    const currentTask = tasks[taskId];
    currentTask.crawledPages[page.url] = { title: page.title, links: page.links, depth: currentTask.currentDepth };
    redisCache[page.url] = { title: page.title, links: page.links };

    currentTask.pagesInNextLevel.push(...page.links);

    // checks whether all pages at current depth have been crawled by checking if all tasks sent to sqs have returned
    if (Object.keys(currentTask.crawledPages).length === currentTask.numOfPagesSentToCrawler) {
        crawlNextLevel(currentTask, taskId);
    }
}



const startWorkers = () => {
    console.log('Start workers')
    workers.forEach(async (workerUrl) => {
        try {
            await axios.get(workerUrl);
        } catch (err) {
            console.log(err);
        }
    })
}


module.exports = { startWorkers, createTsk, controlTasks, endCrawlEvent }

