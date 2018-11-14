const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const tagsSchema = new Schema({
    tags: {type: [String], default: []}
});

const Tags = mongoose.model('Tags', tagsSchema);
module.exports = Tags;