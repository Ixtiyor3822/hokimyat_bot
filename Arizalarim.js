const mongoose = require('mongoose');
const arizamSchema = mongoose.Schema({
    userid: {type: Number, ref: 'User'},
    audioid: {type:String, default: null},
    documentid: {type:String, default: null},
    photoid: {type:String, default: null},
    messageid: {type:String, default: null},
    voiseid: {type:String, default: null},
    date: {type: Date, default: Date()}
})
module.exports = mongoose.model('Ariza', arizamSchema);