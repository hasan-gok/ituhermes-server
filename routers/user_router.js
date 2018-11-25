const express = require('express');
let router = express.Router();
const auth = require('../utility/auth');
const userModel = require('../models/User');
router.all('*', auth.jwt_middleware);
router.get('/', function (req, res, next) {
    userModel.findOne({email: req.user.email}).then((user) => {
        if (!user) {
            res.sendStatus(404);
            return next();
        }
        res.status(200).json(user);
        return next();
    }).catch(next);

});
router.put('/fbToken', (req, res, next) => {
    console.log("new token");
    console.log(req.body.fbToken);
    userModel.findOne({email: req.user.email}).then((user) => {
        user.firebaseToken = req.body.fbToken;
        user.save().then(() => {
            res.sendStatus(200);
            return next();
        }).catch(next);
    }).catch(next);
});
router.route('/tag/:name')
    .delete(function (req, res, next) {
        const tag_name = req.params.name;
        userModel.findOne({email: req.user.email}).then((user) => {
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
        }).catch(next);
    })
    .put(function (req, res, next) {
        const tag_name = req.params.name;
        userModel.findOne({email: req.user.email}).then((user) => {
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
        }).catch(next);
    });


module.exports = router;