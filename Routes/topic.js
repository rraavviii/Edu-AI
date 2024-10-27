const express = require('express');
const router=express.Router();
const usermodel = require('../model/user');
const infomodel = require('../model/info');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const key=require('../helper/generatekey')
const isLoggedin=require('../middleware/isLoggedin')
const multer = require('multer');
const path = require('path');
router.get('/topic', (req, res) => {
    res.render('topic');
});


const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, and DOCs Only!');
    }
}




router.post('/topic', isLoggedin, upload.single('document'), async (req, res) => {
    let { topic, content } = req.body;
    let user = await usermodel.findOne({ email: req.user.email });

    // Initialize the new topic object
    let newTopic = {
        user: user._id,
        topic,
        content,
    };

    // Check if a file was uploaded
    if (req.file) {
        newTopic.document = req.file.filename; // Add the filename if file exists
    }

    // Create a new message with the topic data
    let message = await infomodel.create(newTopic);
    user.infos.push(message._id);
    await user.save();

    res.redirect('/threads');
});



// router.post('/topic', isLoggedin, upload.single('doc'), async (req, res) => {
//     let { topic, content,document} = req.body;
//     let user = await usermodel.findOne({ email: req.user.email });
//     let doc= req.file.filename
//     let newTopic = {
//         user: user._id,
//         topic,
//         content,
//         document,
//     };

//     if (req.file) {
//         newTopic.document = req.file.filename; // Assuming your model has a document field
//     }

//     let message = await infomodel.create(newTopic);
//     user.infos.push(message._id);
//     await user.save();

//     res.redirect('/threads');
// });




module.exports = router