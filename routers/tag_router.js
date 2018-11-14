const express = require('express');
let router = express.Router();
const tagsModel = require('../models/Tags');
router.get('/', function (req, res) {
    tagsModel.findOne().then((tags) => {
        if (tags) {
            res.status(200).json(tags);
        }
    }).catch(() => {
        res.sendStatus(404);
    });
});

module.exports = router;