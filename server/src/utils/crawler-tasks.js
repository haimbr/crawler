const { sendUrlToSqs } = require('./sqs');
const EventEmitter = require('events')
EventEmitter.prototype._maxListeners = 100;
const CrawlerEvent = new EventEmitter();
const { getDataFromRedis, saveTaskInRedis, savePageInRedis } = require('./redis');

 

const createTask = async (taskId, maxPages, maxDepth) => {
    const task = {
        maxPages: parseInt(maxPages),
        maxDepth: parseInt(maxDepth),
        crawledPages: [],
        numOfPagesSentToCrawler: 1,
        pagesInCurrentDepth: [],
        currentDepth: 0
    }
    await saveTaskInRedis(taskId, task);
}



const isTaskCompleted = (task, pagesInNextDepth) => {
    return task.crawledPages.length >= task.maxPages
        || task.currentDepth >= task.maxDepth
        || pagesInNextDepth.length === 0;
}


 
const getPagesInNextDepth = (task) => {
    let pagesInNextDepth = [];
    task.pagesInCurrentDepth.forEach((page) => pagesInNextDepth.push(...page.links));
    // remove duplicates.
    pagesInNextDepth = [...new Set(pagesInNextDepth)];
    // if passed the max page limit reduce the length of pagesInNextDepth.
    pagesInNextDepth.length = Math.min(pagesInNextDepth.length, task.maxPages - task.crawledPages.length);
    return pagesInNextDepth;
}



const crawlNextDepth = async (task, taskId) => {
    let pagesInNextDepth = getPagesInNextDepth(task);

    if (isTaskCompleted(task, pagesInNextDepth)) {
        return CrawlerEvent.emit('crawler-event', { eventType: 'end-crawling', taskId });
    }

    task.numOfPagesSentToCrawler += pagesInNextDepth.length;
    task.currentDepth++;
    task.pagesInCurrentDepth = [];
    await saveTaskInRedis(taskId, task);
    sendUrlsToCrawler(pagesInNextDepth, taskId);
}


const sendUrlsToCrawler = async (urls, taskId) => {
    for (let i = 0; i < urls.length; i++) {
        const redisCache = await getDataFromRedis(urls[i]);
        if (redisCache) {
            await controlTasks(taskId, i, { url: urls[i], ...redisCache });
        } else {
            await sendUrlToSqs(taskId, i, urls[i]);
        }
    };
};




const controlTasks = async (taskId, position, page) => {
    savePageInRedis(page.url, { links: page.links, title: page.title });
    let currentTask = await getDataFromRedis(taskId);
    currentTask.crawledPages.push(page.url);
    currentTask.pagesInCurrentDepth[position] = { ...page, depth: currentTask.currentDepth };
    await saveTaskInRedis(taskId, currentTask);
    CrawlerEvent.emit('crawler-event', { eventType: 'new-result', taskId, data: { ...page, depth: currentTask.currentDepth } });

    // checks whether all pages at current depth have been crawled by checking if all tasks sent to sqs have returned
    if (currentTask.crawledPages.length === currentTask.numOfPagesSentToCrawler) {
        crawlNextDepth(currentTask, taskId);
    }
}
 


module.exports = { createTask, controlTasks, CrawlerEvent, sendUrlsToCrawler }
