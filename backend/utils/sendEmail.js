const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Yeh Gmail ka 16-digit App Password hona chahiye
      },
    });

    const mailOptions = {
      from: `"Auth App" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.response);
  } catch (err) {
    console.error("Nodemailer Error Details:", err); // 🌟 Asli error yahan print hoga
    throw err; // 🌟 Error ko controller tak bhejega taaki registration fail ho agar email na jaye
  }
};

module.exports = sendEmail;