const express = require('express');
let router = express.Router();
const userModel = require('../models/User');
const postModel = require('../models/Post');
const auth = require('../utility/auth');
router.all('*', auth.jwt_middleware);
router.put('/:postId', function (req, res, next) {
    const message = req.body.message;
    postModel.findOne({_id: req.params.postId}).then((post) => {
        userModel.findOne({email: req.user.email}).then((user) => {
            if (post.sender.equals(user._id)) {
                if (message.length > 0) {
                    post.message = message;
                    post.save().then(() => {
                        res.sendStatus(200);
                        return next();
                    }).catch(next);
                }
                else {
                    res.sendStatus(404);
                    return next();
                }
            }
            else {
                res.sendStatus(401);
                return next();
            }
        }).catch(next);
    }).catch(next);
});
module.exports = router;
