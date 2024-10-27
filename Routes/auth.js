const express = require('express');
const router=express.Router();
const usermodel = require('../model/user');
const infomodel = require('../model/info');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const key=require('../helper/generatekey')
const nodemailer = require("nodemailer");

const {sendMail}=require('../helper/sendmail')
router.get('/', (req, res) => {
    res.render('signup');
});


router.post('/signup',async function(req,res){
    
        let { name, email, password } = req.body;
        let user = await usermodel.findOne({ email });
        if (user) return res.status(300).send('User already exists');
    
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await usermodel.create({
                    name,
                    email,
                    password: hash,
                });
                let token = jwt.sign({ email: email, userId: user._id }, key);
                
                res.cookie('token', token);
                sendMail(
                    email,
                    'edu AI',
                    `Hi ${name},\n\nThank you for joining Edu-AI community`,
                    
                );
                res.redirect('/login');
            });
            
            
        });
    });
   
    router.get('/login', (req, res) => {
        res.render('login');
    });

    router.post('/login', async function(req, res) {
        let { email, password } = req.body;
        let user = await usermodel.findOne({ email });
        if (!user) return res.status(500).send('something went wrong');
    
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                let token = jwt.sign({ email: email, userId: user._id }, key);
                res.cookie('token', token);
                return res.redirect('/threads');
            
            } else {
                res.redirect('/login');
            }
        });
    });

module.exports = router
