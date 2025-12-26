const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendFormEmail = async (toEmail, formUrl) => {
  const pdfPath = path.join(__dirname, '../../../frontend/public/INFLUENCER COLLABORATION UNDERTAKING 1.pdf');
  
  const attachments = [];
  if (fs.existsSync(pdfPath)) {
    attachments.push({
      filename: 'INFLUENCER COLLABORATION UNDERTAKING.pdf',
      path: pdfPath
    });
  } else {
    console.warn('PDF attachment not found at:', pdfPath);
  }

  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: toEmail,
    subject: 'Influencer Onboarding Form',
    html: `
      <h2>Influencer Onboarding Form</h2>
      <p>Please fill out the influencer onboarding form by clicking the link below:</p>
      <a href="${formUrl}" style="background-color: #5386e4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Fill Form</a>
      <p>Or copy this link: ${formUrl}</p>
      <br/>
      <p><strong>Note:</strong> Please review the attached Influencer Collaboration Undertaking document.</p>
    `,
    attachments: attachments
  };

  return transporter.sendMail(mailOptions);
};

const sendConfirmationEmail = async (toEmail, name) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: toEmail,
      subject: 'Application Submitted Successfully',
      html: `
        <h2>Thank you for your application!</h2>
        <p>Dear ${name},</p>
        <p>Your influencer application has been submitted successfully. We will review it and get back to you soon.</p>
        <p>Best regards,<br>The Team</p>
      `
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendApprovalEmail = async (toEmail, name) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: toEmail,
      subject: 'Application Approved',
      html: `
        <h2>Congratulations!</h2>
        <p>Dear ${name},</p>
        <p>Your influencer application has been approved. Welcome to our platform!</p>
        <p>Best regards,<br>The Team</p>
      `
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendRejectionEmail = async (toEmail, name, reason) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: toEmail,
      subject: 'Application Status Update',
      html: `
        <h2>Application Update</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest. Unfortunately, we cannot proceed with your application at this time.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>Best regards,<br>The Team</p>
      `
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendFormEmail, sendConfirmationEmail, sendApprovalEmail, sendRejectionEmail };