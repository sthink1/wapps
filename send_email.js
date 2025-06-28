// File: send_email.js
const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_ENCRYPTION === 'ssl', // false for TLS (port 587)
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // For testing with self-signed certificates
  },
  pool: true, // Enable connection pooling for efficiency
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP verification failed:', error);
  } else {
    logger.info('SMTP server is ready');
  }
});

// Function to send email
const sendEmail = async ({ name, email, phone, subject, message }) => {
  // Validate required fields
  if (!name || !email || !subject || !message) {
    throw new Error('All required fields must be filled.');
  }

  // Create email body
  const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\nMessage: ${message}`;

  try {
    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: process.env.MAIL_FROM_ADDRESS,
      replyTo: `${name} <${email}>`,
      subject,
      text: body,
    });
    logger.info(`Email sent successfully to ${process.env.MAIL_FROM_ADDRESS} from ${email}`);
    return {
      status: 'success',
      message: `Thank you, ${name}! Your message has been sent successfully.`,
    };
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw new Error(`Unable to send your message. Error: ${error.message}`);
  }
};

module.exports = { sendEmail };