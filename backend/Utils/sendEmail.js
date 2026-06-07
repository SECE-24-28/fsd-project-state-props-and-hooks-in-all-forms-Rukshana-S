const nodemailer = require("nodemailer");

// Create standard transporter (default to ethereal / sandbox settings)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "test.wearly@ethereal.email", 
    pass: process.env.EMAIL_PASS || "wearly123456", 
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"WEARLY Support" <${process.env.EMAIL_USER || "support@wearly.com"}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Email] Message sent: %s`, info.messageId);
    return info;
  } catch (error) {
    console.error("[Email] Send failed:", error.message);
    // Log details to console so dev isn't blocked and we can verify what was sent
    console.log(`[Email Backup Log] To: ${to} | Subject: ${subject} | Text: ${text}`);
    return null;
  }
};

module.exports = sendEmail;
