const express = require('express');
const app = express();
const path = require('path');
const usermodel = require('./model/user');
const infomodel = require('./model/info');
const cookieParser = require('cookie-parser');
const replymodel = require('./model/reply');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const {sendMail}=require('./helper/sendmail')
const multer = require('multer');
const ModerationApi = require("@moderation-api/sdk").default;
const key = require('./helper/generatekey');
const { spawn } = require('child_process');
const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config()

mongoose.connect(process.env.Mongo_uri)
.then(()=> console.log("Database Connected"))
.catch(err =>console.log("MongoDB connection Error : ",err ))


const userRouter=require('./Routes/auth')
const topicRouter=require('./Routes/topic')



app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/', userRouter)
app.use('/',topicRouter)


// app.get('/profile', isLoggedin, (req, res) => {
//     res.render('profile');
// });





// app.get('/threads', isLoggedin, async (req, res) => {
//     let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
//     let messages = await infomodel.find().populate('user').populate({
//         path: 'replies',
//         populate: {
//             path: 'user'
//         }
//     });

//     res.render('threads', { user, messages });
// });

// app.get('/threads', isLoggedin, async (req, res) => {
//     let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
//     let messages = await infomodel.find().populate('user').populate({
//         path: 'replies',
//         populate: {
//             path: 'user'
//         }
//     }).sort({ createdAt: -1 }); // Sort messages by creation date in descending order

//     res.render('threads', { user, messages });
// });




app.get('/threads', isLoggedin, async (req, res) => {
    let user = await usermodel.findOne({ email: req.user.email }).populate('infos');
    let messages = await infomodel.find().populate('user').populate({
        path: 'replies',
        populate: {
            path: 'user'
        }
    }).sort({ createdAt: -1 });

    res.render('threads', { user, messages });
});



app.post('/reply', isLoggedin, async (req, res) => {
    let { replycontent, topicId } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });
    let topic = await infomodel.findById(topicId).populate('user');

    if (!topic) {
        return res.status(404).send('Topic not found');
    }

    let reply = await replymodel.create({
        user: user._id,
        querry: topicId,
        replycontent
    });

    topic.replies.push(reply._id);
    await topic.save();
    user.reply.push(reply._id);
    await user.save();

    res.redirect('/threads');
});





app.get('/chat',(req,res)=>{
  
    res.render('chat')
})




app.post('/log-query-id', async (req, res) => {
    const { queryId } = req.body;

    // Run the Python script and get the summary
    const pythonProcess = spawn('python', ['log_query.py', queryId]);

    let summary = '';
    pythonProcess.stdout.on('data', (data) => {
        summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        res.json({ summary });
    });
});







const moderationApi = new ModerationApi({
    key: process.env.MODERATION_API,


  });
  
  app.post('/flagged-replies', async (req, res) => {
    const { replies } = req.body;
    const flaggedReplies = [];

    for (const reply of replies) {

        const analysis = await moderationApi.moderate.text({
            value: reply.replycontent,
            authorId: reply.user._id,
            contextId: reply._id,
        });

        if (analysis.flagged) {
            console.log('yes')
            flaggedReplies.push(reply._id);
          
            const replyUser = await usermodel.findById(reply.user._id);
            if (replyUser && replyUser.email) {
                sendMail(
                    replyUser.email,
                    'edu AI : Guidelines Violation Notification',
                    `Hi ${replyUser.name},\n\nYour reply violates our community guidelines .\n\nReply Content:\n${reply.replycontent}`,
                    
                );


                const topic = await infomodel.findById(reply.querry).populate('user');
                if (topic && topic.user.email) {
                    sendMail(
                        topic.user.email,
                        'Flagged Reply Notification',
                        `Hi ${replyUser.name},\n\nYour reply violates our community guidelines .\n\nReply Content:\n${reply.replycontent}`,
                    );
                }
            }
            else{
                console.log('no')
            }
        }


                  
    }

    res.json({ flaggedReplies });
});





app.get('/logout', function(req, res) {
    res.cookie('token', "");
    res.redirect('/login');
 });

function isLoggedin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }
    jwt.verify(token, key, (err, data) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.redirect('/login');
        }
        req.user = data;
        next();
    });
}

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
