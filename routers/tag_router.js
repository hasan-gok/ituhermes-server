const express = require('express');
let router = express.Router();
const tagsModel = require('../models/Tags');
router.get('/', function (req, res, next) {
    tagsModel.findOne().then((tags) => {
        if (!tags) {
            return res.sendStatus(404);
        }
        res.status(200).json(tags);
        return next();
    }).catch(next);
});

module.exports = router;