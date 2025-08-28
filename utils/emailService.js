const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// simple send email
const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Blog Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
