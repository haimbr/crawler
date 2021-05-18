const express = require('express');
const router = new express.Router();
const { controlTasks } = require('../utils/crawler-tasks');


router.post('/crawled-pages', (req, res) => {
    controlTasks(req.body.taskId, req.body.position, req.body.data);
    res.send();
});


module.exports = router;