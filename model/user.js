const mongoose = require('mongoose');


let userSchema = mongoose.Schema({
    name: 
    {
       type: String,
       require: true,
        },
    email: {
        type: String,
        require: true,
         },
    password: {
        type: String,
        require: true,
         },
   
    infos:[
        {type: mongoose.Schema.Types.ObjectId,
            ref: 'info'
        }
    ],
    reply:
    [
    {type: mongoose.Schema.Types.ObjectId,
        ref: 'reply'
    }
]
});

module.exports = mongoose.model('user', userSchema);
