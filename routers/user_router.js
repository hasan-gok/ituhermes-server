const express = require('express');
let router = express.Router();
const auth = require('../utility/auth');
router.all('*', auth.jwt_middleware);
router.get('/', function (req, res) {
    res.status(200).json(req.user);
});

router.route('/tag/:name')
    .delete(function (req, res, next) {
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
                    return res.sendStatus(200);
                }).catch(next);
            }
            else {
                return res.sendStatus(404);
            }
        }
        else {
            return res.sendStatus(404);
        }
    })
    .put(function (req, res, next) {
        let user = req.user;
        const tag_name = req.params.name;
        let error = true;
        if (user) {
            if (tag_name) {
                error = false;
                user.tags.push(tag_name);
                user.save().then(() => {
                    res.sendStatus(200);
                    return next();
                }).catch(next);
            }
        }
        if (error) {
            return res.sendStatus(404);
        }
    });


module.exports = router;