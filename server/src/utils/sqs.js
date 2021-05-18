
const AWS = require('aws-sdk');
const QUEUE_URL = "https://sqs.eu-west-1.amazonaws.com/804484736958/ex1";



const sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region: 'eu-west-1',
})


const sendUrlToSqs = async (taskId, position, pageUrl) => {
    try {
        await sqs.sendMessage({
            QueueUrl: QUEUE_URL,
            MessageAttributes: {
                "taskId": {
                    DataType: "String",
                    StringValue: taskId
                },
                "positionInCurrentDepth": {
                    DataType: "String",
                    StringValue: position.toString(),
                },
            },
            MessageBody: pageUrl
        }).promise();
    } catch (err) {
        console.log(err);
    }
};



module.exports = { sendUrlToSqs }