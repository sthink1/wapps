// File: send_email.js
const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

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

// Function to send login verification code
const sendVerificationCode = async ({ email, verificationCode, username }) => {
  // Validate required fields
  if (!email || !verificationCode || !username) {
    throw new Error('Email, verification code, and username are required.');
  }

  // Create plain-text fallback body
  const textBody = `
Hello ${username},

Your WonderfulApps login verification code is:

${verificationCode}

This code will expire in 10 minutes.

Do not share this code with anyone.

If you did not attempt to log in, please ignore this email.
  `.trim();

  // Create HTML version
  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Login Verification</h2>
  <p>Hello <strong>${username}</strong>,</p>
  <p>Your WonderfulApps login verification code is:</p>
  <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
    <p style="font-size: 32px; letter-spacing: 3px; font-weight: bold; color: #007bff; margin: 0;">${verificationCode}</p>
  </div>
  <p style="color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
  <p style="color: #666;"><strong>Do not share this code with anyone.</strong></p>
  <p style="color: #999; font-size: 12px;">If you did not attempt to log in, please ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
  <p style="color: #999; font-size: 12px;">WonderfulApps Security Team</p>
</div>
  `.trim();

  try {
    await resend.emails.send({
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Your WonderfulApps Login Verification Code',
      text: textBody,
      html: htmlBody,
    });

    logger.info(`Login verification code sent to ${email}`);

    return {
      status: 'success',
      message: 'Verification code sent to your email.',
    };
  } catch (error) {
    logger.error(`Failed to send verification code: ${error.message}`);
    throw new Error('Unable to send verification code at this time.');
  }
};



// General outbound notification email used by the central notification service.
// Optional categories receive an unsubscribe link. Account/security and required
// subscription messages do not use an unsubscribe link.
const sendNotificationEmail = async ({
  email,
  subject,
  message,
  category,
  unsubscribeUrl = null,
  explainFamilyTreeRecipient = false,
}) => {
  if (!email || !subject || !message || !category) {
    throw new Error('Email, subject, message, and category are required.');
  }

  const safeMessage = String(message);
  const escapedMessage = escapeHtml(safeMessage).replace(/\n/g, '<br>');
  const safeUnsubscribeUrl = unsubscribeUrl ? escapeHtml(unsubscribeUrl) : null;

  let textFooter = '';
  let htmlFooter = '';

  if (category === 'FAMILY_TREE' && explainFamilyTreeRecipient) {
    textFooter += `\n\nWhy did I receive this email?\nYour email address is associated with a person profile in a Wonderful Apps Family Tree. You do not need to have a Wonderful Apps account to receive this notification.`;
    htmlFooter += `
      <p style="margin-top: 20px;"><strong>Why did I receive this email?</strong><br>
      Your email address is associated with a person profile in a Wonderful Apps Family Tree.
      You do not need to have a Wonderful Apps account to receive this notification.</p>`;
  }

  if (safeUnsubscribeUrl) {
    const label = category === 'FAMILY_TREE'
      ? 'Stop Family Tree Notifications'
      : 'Unsubscribe';

    textFooter += `\n\n${label}: ${unsubscribeUrl}`;
    htmlFooter += `
      <p style="margin-top: 20px;">
        <a href="${safeUnsubscribeUrl}">${escapeHtml(label)}</a>
      </p>`;
  }

  const textBody = `${safeMessage}${textFooter}`;
  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; line-height: 1.45;">
  <h2 style="color: #333;">Wonderful Apps Notification</h2>
  <p>${escapedMessage}</p>
  ${htmlFooter}
  <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
  <p style="color: #777; font-size: 12px;">
    This is an automated Wonderful Apps notification.
  </p>
</div>
  `.trim();

  try {
    await resend.emails.send({
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    logger.info(`Notification email sent to ${email} (${category})`);
    return { status: 'success', message: 'Notification sent.' };
  } catch (error) {
    logger.error(`Failed to send notification to ${email}: ${error.message}`);
    throw new Error('Unable to send notification at this time.');
  }
};

// Backward-compatible wrapper. New application code should use notificationService.
const sendFamilyTreeNotification = async ({ email, subject, message, unsubscribeUrl = null }) => {
  return sendNotificationEmail({
    email,
    subject,
    message,
    category: 'FAMILY_TREE',
    unsubscribeUrl,
    explainFamilyTreeRecipient: false,
  });
};

module.exports = {
  sendEmail,
  sendVerificationCode,
  sendNotificationEmail,
  sendFamilyTreeNotification,
};
