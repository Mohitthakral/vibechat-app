const verificationEmailTemplate = (username, verificationLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to VibeChat!</h1>
        </div>
        <div class="content">
          <p>Hey ${username}! 👋</p>
          <p>Thanks for joining VibeChat! We're excited to have you on board.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>Happy chatting! 💬</p>
        </div>
        <div class="footer">
          <p>© 2024 VibeChat. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { verificationEmailTemplate };