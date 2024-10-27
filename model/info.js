const mongoose = require('mongoose');

let infoSchema = mongoose.Schema({
    topic: {
        type: String,
        require: true,
         },
    content: {
        type: String,
        require: true,
         },
    document: {
        type: String,
         },
    user: {
         type: mongoose.Schema.Types.ObjectId,
          ref: 'user' 
        },

    replies: 
    [
        { 
            type: mongoose.Schema.Types.ObjectId,
             ref: 'reply' 
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('info', infoSchema);
