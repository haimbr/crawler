const AWS = require('aws-sdk');
const queueUrl = process.env.QUEUE_URL;


const sqs = new AWS.SQS({
    apiVersion: "2012-11-05",
    region: process.env.AWS_REGION
});

const getTasksFromSqs = async () => {
    try {
        const { Messages } = await sqs.receiveMessage({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            MessageAttributeNames: [
                "All"
            ],
            VisibilityTimeout: 80,
            WaitTimeSeconds: 15
        }).promise();
        return Messages || [];
    } catch (err) {
        console.log(err);
    }
};


const deleteTasksFromSqs = async (message) => {
    try {
        sqs.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle
        }).promise()
    } catch (err) {
        console.log(err);
    }
}




module.exports = { getTasksFromSqs, deleteTasksFromSqs };
