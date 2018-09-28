require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dbHandler = require('./db_handler');
const userModel = require('./models/User');
const host = process.env.HOST || 'localhost';
const port = process.env.PORT;
dbHandler.then(() => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:false}));
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
            res.status(200).send(message);
        }).catch((reason) => {
            message.code = '3';
            res.status(200).send(message);
            console.error(reason);
        });
    });
    app.listen(port);
}).catch(
    (reason) => {console.error(reason);}
);