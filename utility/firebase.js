let service = {};
var admin = require("firebase-admin");
const serviceAccount = require("../itu-hermes-firebase-adminsdk-a2b0h-1b2ab1e1f9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://itu-hermes.firebaseio.com"
});
service.sendNewTopicMessage = (user, title, topicId, tag) => {
    let message = {
        data: {
            topicId: topicId.toString(),
            title: title,
            tag: tag,
            type: 'topic'
        },
        token: user.firebaseToken
    };
    admin.messaging().send(message)
        .then((response) => {
            console.log(response);
        }).catch((error) => {
        console.error(error);
    });
};

service.sendNewPostMessage = (sender, receiver, topicId, post, date) => {
    let message = {
        data: {
            sender: sender.name + " " + sender.lastName,
            post: post,
            date: date,
            topicId: topicId.toString(),
            type: 'post'
        },
        token: receiver.firebaseToken
    };
    admin.messaging().send(message)
        .then((response) => {
            console.log(response);
        }).catch((error) => {
        console.error(error);
    });
};
module.exports = service;