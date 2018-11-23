const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
    email: {type:String, unique:true, required:true},
    password: {type:String, required: true},
    name: {type: String, required: true},
    lastName: {type: String, required: true},
    tags: {type: [String], default: []},
    subscribing: {type: [Schema.Types.ObjectId], ref: 'Topic'}
});

userSchema.methods.hash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.pre('save', function(next){
    if (this.isModified('password')) {
        this.password = this.hash(this.password);
        next();
    }
    else {
        return next();
    }
});
userSchema.methods.validatePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;