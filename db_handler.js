const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || "27017";
const db_name = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const uri = "mongodb://" + username + ':' + password + '@' + host + ':' + port + '/' +  db_name;
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const connect = new Promise(function(resolve, reject){
   mongoose.connect(uri, {useNewUrlParser:true}).then(
       function(){
           resolve();
       }
   ).catch(
       function(reason){
           reject(reason);
       }
   )
});

module.exports = connect;