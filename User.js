const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    username: {type: String, unique: true, default: ''},
    userid: {type: Number, unique: true, default: null},
    ismi: {type: String ,default: null, trim: true},
    familiyasi: {type: String, default: null, trim: true},
    lavozimi: {type: String, default: 'user'},
    passport: {type: String, default: null},
    contact: {type: String, default: null}

})
module.exports = mongoose.model('User', userSchema);