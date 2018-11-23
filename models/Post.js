const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const postSchema = Schema({
    message: {type: String, required: true},
    sender: {type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});
const Post = mongoose.model('Post', postSchema);
module.exports = Post;