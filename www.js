require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dbHandler = require('./db_handler');
const userModel = require('./models/User');
const port = process.env.PORT || 5000;
const auth = require('./utility/auth');
dbHandler.then(() => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false}));
    app.use('/user', require('./routers/user_router'));
    app.use('/tags', require('./routers/tag_router'));
    app.use('/topic', require('./routers/topic_router'));
    app.use('/post', require('./routers/post_router'));
    app.get('/', function(req, res){
        res.send('Welcome!');
    });
    app.post('/login', function(req, res){
        let data = req.body;
        let email = data.email;
        let password = data.password;
        let message = {};
        userModel.findOne({email:email}).then((data) => {
            if (data !== undefined && data !== null){
                if (data.validatePassword(password)){
                    message.code = '0';
                }
                else{
                    message.code = '1';
                }
            }
            else{
                message.code = '2';
            }
            message.token = auth.createJWTToken({sessionData: data});
            res.status(200).json(message);
        }).catch((reason) => {
            message.code = '3';
            res.status(200).send(message);
            console.error(reason);
        });
    });
    app.post('/signup', function(req, res){
        let data = req.body;
        let name = data.name;
        let lastName = data.lastName;
        let email = data.email;
        let password = data.password;
        let message = {};
        userModel.findOne({email:email}).then((data)=>{
            if (data === undefined || data === null){
                let newUser = new userModel();
                newUser.name = name;
                newUser.lastName = lastName;
                newUser.email = email;
                newUser.password = password;
                newUser.tags = [];
                newUser.save().then(() => {
                    message.code = "0";
                    res.status(200).send(message);
                }).catch((reason)=>{
                    message.code = "1";
                    res.status(200).send(message);
                    console.error(reason);
                });
            }
            else{
                message.code = "2";
                res.status(200).send(message);
            }
        }).catch((reason) => {
            message.code = "3";
            res.status(200).send(message);
            console.error(reason);
        });
    });
    app.use(function (err, req, res, next) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }
        return next();
    });
    app.listen(port);
}).catch(
    (reason) => {console.error(reason);}
);