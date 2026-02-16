# Email Service Setup Guide

This guide explains how to set up email functionality for HOSPProject.

## Overview

The email service has been created at `src/app/services/email.service.ts` and includes:
- ✅ Verification email templates
- ✅ Welcome email templates
- ✅ Password reset email templates
- ✅ Generic email sending functionality

## Backend Requirements

You need a **backend API** to actually send emails. The Angular frontend calls your backend, which then sends emails using an SMTP server.

### Option 1: Node.js/Express Backend (Recommended)

#### 1. Install Required Packages

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

#### 2. Create Email Route (`server/routes/email.js`)

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',  // Your SMTP host
  port: 587,               // 587 for TLS, 465 for SSL
  secure: false,           // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,     // Your email
    pass: process.env.EMAIL_PASSWORD  // Your email password or app-specific password
  }
});

// Send email endpoint
router.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const mailOptions = {
      from: `"HOSPProject" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

module.exports = router;
```

#### 3. Add to your Express app (`server/app.js`)

```javascript
const emailRouter = require('./routes/email');
app.use('/api/email', emailRouter);
```

#### 4. Environment Variables (`.env`)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Option 2: Using Gmail

#### Prerequisites:
1. **Gmail Account** with 2-Factor Authentication enabled
2. **App-Specific Password** (not your regular Gmail password)

#### Steps to Get Gmail App Password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled
3. Go to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "HOSPProject" as the name
6. Copy the generated 16-character password
7. Use this password in your `.env` file

#### Gmail Configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-16-char-app-password'
  }
});
```

### Option 3: Using SendGrid (Production Recommended)

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/send', async (req, res) => {
  const { to, subject, html, text } = req.body;

  const msg = {
    to: to,
    from: 'noreply@yourhosp.com',
    subject: subject,
    text: text,
    html: html,
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Option 4: Using AWS SES

```bash
npm install @aws-sdk/client-ses
```

```javascript
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

router.post('/send', async (req, res) => {
  const { to, subject, html, text } = req.body;

  const params = {
    Source: 'noreply@yourhosp.com',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text }
      }
    }
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Information Needed for Email Setup

### Required Configuration:

1. **SMTP Host**:
   - Gmail: `smtp.gmail.com`
   - Outlook: `smtp-mail.outlook.com`
   - Yahoo: `smtp.mail.yahoo.com`
   - Custom: Your hosting provider's SMTP server

2. **SMTP Port**:
   - `587` (TLS - recommended)
   - `465` (SSL)
   - `25` (unencrypted - not recommended)

3. **Email Credentials**:
   - Email address (sender)
   - Password or App-Specific Password

4. **From Address**:
   - The email address users will see as sender
   - Example: `noreply@hospproject.com`

5. **Backend API URL**:
   - Update in `email.service.ts`:
   ```typescript
   private apiUrl = 'http://localhost:3000/api/email';
   ```

## Integration with Auth Service

To send verification emails on registration, update `auth.service.ts`:

```typescript
import { EmailService } from './email.service';

constructor(
  private http: HttpClient,
  private router: Router,
  private emailService: EmailService  // Add this
) { ... }

register(userData: RegisterRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
    tap(response => {
      // Generate verification token (usually done on backend)
      const verificationToken = response.token || 'demo-token';

      // Send verification email
      this.emailService.sendVerificationEmail(
        userData.email,
        userData.username,
        verificationToken
      ).subscribe({
        next: (emailResponse) => {
          console.log('Verification email sent:', emailResponse);
        },
        error: (error) => {
          console.error('Failed to send verification email:', error);
        }
      });
    })
  );
}
```

## Testing Email Service

### 1. Using Mailtrap (Development)

Mailtrap is perfect for testing emails without sending real emails:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'your-mailtrap-user',
    pass: 'your-mailtrap-pass'
  }
});
```

Sign up at [mailtrap.io](https://mailtrap.io) to get credentials.

### 2. Using Ethereal (Development)

Ethereal creates temporary test accounts:

```javascript
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});
```

## Security Best Practices

1. ✅ **Never commit credentials** - Use environment variables
2. ✅ **Use app-specific passwords** - Not your main email password
3. ✅ **Enable 2FA** - On your email account
4. ✅ **Validate email addresses** - Before sending
5. ✅ **Rate limiting** - Prevent email spam
6. ✅ **Use TLS/SSL** - Encrypt email transmission
7. ✅ **Verify sender domain** - Use SPF, DKIM, DMARC records

## Production Recommendations

For production, use a dedicated email service:

1. **SendGrid** - 100 free emails/day, then pay-as-you-go
2. **AWS SES** - $0.10 per 1,000 emails
3. **Mailgun** - 5,000 free emails/month
4. **Postmark** - 100 free emails/month

These services provide better deliverability and email tracking.

## Checklist

- [ ] Choose email provider (Gmail, SendGrid, AWS SES, etc.)
- [ ] Create backend API endpoint for sending emails
- [ ] Set up SMTP credentials or API keys
- [ ] Configure environment variables
- [ ] Test email sending with Mailtrap/Ethereal
- [ ] Update `email.service.ts` API URL
- [ ] Integrate with auth service registration
- [ ] Create email verification component
- [ ] Test full registration flow
- [ ] Move to production email service

## Support

If you need help setting up emails, provide:
1. Which email provider you want to use
2. Your backend framework (Node.js, Python, etc.)
3. Any error messages you encounter
