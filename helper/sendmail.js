const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  
  secure: false, 
  auth: {
    user: "21052267@kiit.ac.in",
    pass: "einanlvocpyjylmu",
  },
});


async function sendMail(to, subject, text) {
  
  const info = await transporter.sendMail({
    from: '21052267@kiit.ac.in', 
    to, 
    subject,
    text, 
  });


}

module.exports = {sendMail}

