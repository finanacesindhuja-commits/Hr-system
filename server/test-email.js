require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function test() {
  console.log('--- Email Test Starting ---');
  console.log('User:', process.env.EMAIL_USER);
  
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Successful');
    
    const info = await transporter.sendMail({
      from: `"Sindhuja Finance Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email from HR System",
      text: "If you are reading this, your email configuration is working perfectly!"
    });
    
    console.log('✅ Email Sent! MessageID:', info.messageId);
  } catch (err) {
    console.error('❌ Email Test Failed:', err.message);
    if (err.message.includes('Invalid login')) {
        console.error('TIP: Make sure you are using a Google "App Password", not your regular password.');
    }
  }
}

test();
