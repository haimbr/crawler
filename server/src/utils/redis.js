const redisClient = require('../../db/redis');




const getDataFromRedis = async (key) => {
    try {
        return JSON.parse(await redisClient.getAsync("search:" + key));
    } catch (err) {
        console.log(err);
    }
} 


const saveTaskInRedis = async (taskId, data) => {
    await redisClient.setAsync("search:" + taskId, JSON.stringify(data));
}


const savePageInRedis = async (url, data) => {
    redisClient.setexAsync(
        "search:" + url,
        // 60 * 20,
        20,
        JSON.stringify(data)
    );
}

module.exports = { getDataFromRedis, saveTaskInRedis, savePageInRedis }