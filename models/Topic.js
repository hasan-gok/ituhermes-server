const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const auto_increment = require('mongoose-auto-increment');
auto_increment.initialize(mongoose.connection);
const Schema = mongoose.Schema;

const topicSchema = Schema({
    topicId: {type: Number},
    title: {type: String, unique: true, required: true},
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    tag: {type: String, required: true},
    subscribers: {type: [Schema.Types.ObjectId], ref: 'User'}
}, {timestamps: true});
const Topic = mongoose.model('Topic', topicSchema);

topicSchema.plugin(auto_increment.plugin, {
    model: 'Topic',
    field: 'topicId',
    startAt: 0,
    incrementBy: 10
});
module.exports = Topic;