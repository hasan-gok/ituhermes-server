const express = require('express');
const router = express.Router();
const topicModel = require('../models/Topic');
const userModel = require('../models/User');
const postModel = require('../models/Post');
const Constants = require('../Constants');
const auth = require('../utility/auth');
router.all('*', auth.jwt_middleware);

const checkSubscription = function (userEmail, topicId) {
    return new Promise(function (resolve, reject) {
        userModel.findOne({email: userEmail}).then((user) => {
            topicModel.findOne({topicId: topicId}).then((topic) => {
                let id = topic.subscribers.find((id) => {
                    if (id.equals(user._id)) {
                        return true;
                    }
                });
                if (id) {
                    return resolve({user: user, topic: topic, isSubscribing: true});
                }
                else {
                    return resolve({user: user, topic: topic, isSubscribing: false});
                }
            }).catch((err) => {
                    return reject(err);
                }
            );
        }).catch((err) => {
            return reject(err);
        });
    });
};


router.put('/:topicId/subscribe', function (req, res, next) {
    let data = req.body;
    if (!data) {
        return res.sendStatus(404);
    }
    let email = req.user.email;
    checkSubscription(email, req.params.topicId).then((result) => {
        if (result.isSubscribing) {
            res.sendStatus(200);
            return next();
        }
        else {
            let topic = result.topic;
            let user = result.user;
            topic.subscribers.push(user._id);
            user.subscribing.push(topic._id);
            topic.save().then(() => {
                user.save().then(() => {
                    res.sendStatus(200);
                    return next();
                }).catch(next);
            }).catch(next)
        }
    }).catch(next);
});
router.delete('/:topicId/subscribe', function (req, res, next) {
    let email = req.user.email;
    checkSubscription(email, req.params.topicId).then((result) => {
        if (!result.isSubscribing) {
            res.sendStatus(200);
            return next();
        }
        else {
            let topic = result.topic;
            let user = result.user;
            topic.subscribers = topic.subscribers.filter((id) => {
                return !id.equals(user._id);
            });
            user.subscribing = user.subscribing.filter((id) => {
                return !id.equals(topic._id);
            });
            topic.save().then(() => {
                user.save().then(() => {
                    res.sendStatus(200);
                    return next();
                }).catch(next);
            }).catch(next)
        }
    }).catch(next);
});

router.get('/:topicId/posts', function (req, res, next) {
    topicModel.findOne({topicId: req.params.topicId})
        .populate({
            path: 'posts',
            select: ['message', 'sender'],
            populate: {path: 'sender', select: ['name', 'lastName']}
        }).then((topic) => {
        if (!topic) {
            return res.sendStatus(404);
        }
        res.status(200).json(topic.posts);
        return next();
    }).catch(next);
});
router.get('/:topicId/:pageNumber/posts', function (req, res, next) {
    topicModel.findOne({topicId: req.params.topicId}).populate({
        path: 'posts',
        select: ['message', 'sender', 'createdAt'],
        populate: {path: 'sender', select: ['name', 'lastName']}
    }).then((topic) => {
        if (!topic) {
            return res.sendStatus(404);
        }
        let pageSplit = Constants.postCountPerPage;
        let pageNum = req.params.pageNumber;
        const base = pageSplit * pageNum;
        if (pageNum >= 0) {
            topic = topic.toObject({getters: false});
            topic.posts = topic.posts.slice(base, base + pageSplit);
            for (let i = 0; i < topic.posts.length; i++) {
                let date = new Date(topic.posts[i].createdAt);
                topic.posts[i].date = date.toLocaleDateString('en-Us', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false
                });
            }
            res.status(200).json({posts: topic.posts});
            return next();
        }
    }).catch(next);
});

router.get('/', function (req, res, next) {
    userModel.findOne({email: req.user.email}).then((user) => {
        topicModel.find().then((topics) => {
            let retTopics = [];
            let rangeStart = req.query.rangeStart;
            let increment = req.query.increment;
            if (!rangeStart || rangeStart < 0) {
                rangeStart = 0;
            }
            else if (rangeStart > topics.length - 1) {
                rangeStart = topics.length;
            }
            if (!increment || increment <= 0) {
                increment = 10;
            }
            let upperLimit = 0;
            if (rangeStart + increment > topics.length) {
                upperLimit = topics.length;
            }
            else {
                upperLimit = (rangeStart + increment) % (topics.length + 1);
            }
            for (let i = rangeStart; i < upperLimit; i++) {
                let data = {};
                data.title = topics[i].title;
                data.tag = topics[i].tag;
                data.topicId = topics[i].topicId;
                data.postSize = topics[i].posts.length;
                data.pageCount = Math.floor(data.postSize / Constants.postCountPerPage) + 1;
                data.isSubscribing = false;
                for (let j = 0; j < topics[i].subscribers.length; j++) {
                    if (topics[i].subscribers[j].equals(user._id)) {
                        data.isSubscribing = true;
                        break;
                    }
                }
                retTopics.push(data);
            }
            res.status(200).json({topics: retTopics});
            return next();
        }).catch(next);
    }).catch(next);
});
router.put('/', function (req, res, next) {
    let data = req.body;
    if (data) {
        try {
            let newTopic = new topicModel();
            newTopic.title = data.title;
            newTopic.tag = data.tag;
            userModel.findOne({email: req.user.email})
                .then((user) => {
                    if (!user) {
                        return res.sendStatus(404);
                    }
                    newTopic.owner = user._id;
                    newTopic.subscribers.push(user._id);
                    newTopic.save().then((topic) => {
                        res.status(200).send({topicId: topic.topicId});
                        return next();
                    }).catch(next);
                }).catch(next);
        } catch (err) {
            return next(err);
        }
    }
    else {
        return next('error');
    }
});

router.put('/:topicId/posts/', function (req, res, next) {
    checkSubscription(req.user.email, req.params.topicId)
        .then((result) => {
            if (result.isSubscribing) {
                let user = result.user;
                let topic = result.topic;
                let newPost = new postModel();
                newPost.message = data.message;
                newPost.sender = user._id;
                newPost.save().then((post) => {
                    topic.posts.push(post._id);
                    topic.save().then(() => {
                        res.sendStatus(200);
                        return next();
                    }).catch(next);
                }).catch(next);
            }
            else {
                res.sendStatus(401);
                return next();
            }
        }).catch(next);
});


module.exports = router;