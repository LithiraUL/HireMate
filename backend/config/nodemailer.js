const nodemailer = require('nodemailer');

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `HireMate <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Interview invitation email template
const interviewInvitationEmail = (candidateName, employerName, companyName, interviewDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Interview Invitation</h1>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          <p>Congratulations! You have been invited for an interview by <strong>${companyName}</strong>.</p>
          
          <div class="details">
            <h3>Interview Details:</h3>
            <p><strong>Date:</strong> ${new Date(interviewDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${interviewDetails.time}</p>
            <p><strong>Mode:</strong> ${interviewDetails.mode}</p>
            ${interviewDetails.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a></p>` : ''}
            ${interviewDetails.location ? `<p><strong>Location:</strong> ${interviewDetails.location}</p>` : ''}
          </div>

          ${interviewDetails.notes ? `<p><strong>Additional Notes:</strong><br/>${interviewDetails.notes}</p>` : ''}
          
          <p>Please log in to your HireMate account to confirm or decline this interview invitation.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/candidate/dashboard" class="button">View in Dashboard</a>
          </center>
          
          <p>If you have any questions, please contact the employer directly through the platform.</p>
          
          <p>Best regards,<br/>The HireMate Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 HireMate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Interview status update email template
const interviewStatusEmail = (employerName, candidateName, status, interviewDetails) => {
  const statusMessages = {
    confirmed: 'has confirmed',
    declined: 'has declined'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${status === 'confirmed' ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Interview ${status === 'confirmed' ? 'Confirmed' : 'Declined'}</h1>
        </div>
        <div class="content">
          <p>Dear ${employerName},</p>
          <p>${candidateName} ${statusMessages[status]} the interview invitation.</p>
          
          <div class="details">
            <h3>Interview Details:</h3>
            <p><strong>Date:</strong> ${new Date(interviewDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${interviewDetails.time}</p>
          </div>
          
          <p>Please log in to your HireMate account to view more details.</p>
          
          <p>Best regards,<br/>The HireMate Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 HireMate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Job invitation email template
const jobInvitationEmail = (candidateName, employerName, companyName, jobDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .message { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 You're Invited to Apply!</h1>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          
          <p>Great news! <strong>${employerName}</strong> from <strong>${companyName}</strong> has reviewed your profile and would like to invite you to apply for an exciting opportunity.</p>
          
          <div class="details">
            <h3 style="color: #3b82f6; margin-top: 0;">📋 Position: ${jobDetails.title}</h3>
          </div>

          ${jobDetails.message ? `
          <div class="message">
            <h4 style="margin-top: 0; color: #3b82f6;">Personal Message from ${employerName}:</h4>
            <p style="margin: 0;">${jobDetails.message}</p>
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${jobDetails.applicationLink}" class="button">View Position & Apply</a>
          </div>

          <p style="margin-top: 30px;">This is a personalized invitation based on your skills and experience. We believe you could be a great fit for this role!</p>
          
          <p>Best regards,<br>
          The HireMate Team</p>
        </div>
        <div class="footer">
          <p>This invitation was sent via HireMate</p>
          <p>&copy; 2024 HireMate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  interviewInvitationEmail,
  interviewStatusEmail,
  jobInvitationEmail
};
