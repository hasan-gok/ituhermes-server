const express = require('express');
const userModel = require('../models/User');
let router = express.Router();

router.param('email', function (req, res, next, email) {
    userModel.findOne({"email": email}).then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }
        req.user = user;
        return next();
    }).catch(next);
});
router.get('/:email', function (req, res) {
    res.status(200).json(req.user);
});

router.route('/:email/tag/:name')
    .delete(function (req, res) {
        let user = req.user;
        const tag_name = req.params.name;
        if (user) {
            if (tag_name) {
                let tags = [];
                for (let i = 0; i < user.tags.length; i++) {
                    if (user.tags[i] !== tag_name) {
                        tags.push(user.tags[i]);
                    }
                }
                user.tags = tags;
                user.save().then(() => {
                    res.sendStatus(200);
                }).catch(() => {
                    res.sendStatus(304);
                });
            }
        }
    })
    .put(function (req, res) {
        let user = req.user;
        const tag_name = req.params.name;
        if (user) {
            if (tag_name) {
                user.tags.push(tag_name);
                user.save().then(() => {
                    res.sendStatus(200);
                }).catch(() => {
                    res.sendStatus(404);
                });
            }
        }
    });


module.exports = router;