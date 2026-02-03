// File: send_email.js
const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send email
const sendEmail = async ({ name, email, phone, subject, message }) => {
  // Validate required fields
  if (!name || !email || !subject || !message) {
    throw new Error('All required fields must be filled.');
  }

  // Create plain-text fallback body
  const textBody = `
Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject}
Message: ${message}
  `.trim();

  // Create HTML version
  const htmlBody = `
<h2>Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || 'N/A'}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
  `.trim();

  try {
    await resend.emails.send({
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
      to: process.env.MAIL_TO_ADDRESS,
      reply_to: email,
      subject,
      text: textBody,     // plain-text version (required fallback for many clients)
      html: htmlBody,     // rich HTML version
    });

    logger.info(`Contact form email sent from ${email}`);

    return {
      status: 'success',
      message: `Thank you, ${name}! Your message has been sent successfully.`,
    };
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw new Error('Unable to send your message at this time.');
  }
};

module.exports = { sendEmail };