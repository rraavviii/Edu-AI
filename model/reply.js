
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    replycontent: String,
    user:
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'user'
         },

   

    querry: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'info' },

    date: {
        type: Date,
        default: Date.now
    }
},{ timestamps: true });

module.exports = mongoose.model('reply', replySchema);

