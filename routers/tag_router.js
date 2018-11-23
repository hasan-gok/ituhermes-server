const express = require('express');
let router = express.Router();
const tagsModel = require('../models/Tags');
const userModel = require('../models/User');
const auth = require('../utility/auth');
router.all('*', auth.jwt_middleware);
router.get('/', function (req, res, next) {
    tagsModel.findOne().then((tags) => {
        if (!tags) {
            res.sendStatus(404);
            return next();
        }
        userModel.findOne({email: req.user.email}).then((user) => {
            if (!user) {
                res.sendStatus(404);
                return next();
            }
            reducedTags = [];
            for (let i = 0; i < tags.length; i++) {
                let exists = false;
                for (let j = 0; j < user.tags.length; j++) {
                    if (tags[i].equals(user.tags[j])) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    reducedTags.push(tags[i]);
                }
            }
            res.status(200).json({reducedTags});
            return next();
        }).catch(next);
    }).catch(next);
});

module.exports = router;