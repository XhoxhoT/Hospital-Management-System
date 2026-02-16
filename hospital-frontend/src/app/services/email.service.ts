import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailConfig {
  // SMTP Configuration
  smtpHost: string;          // e.g., 'smtp.gmail.com'
  smtpPort: number;          // e.g., 587 for TLS, 465 for SSL
  smtpSecure: boolean;       // true for SSL, false for TLS
  smtpUser: string;          // Your email address
  smtpPassword: string;      // Your email password or app-specific password

  // Email Options
  fromEmail: string;         // Sender email address
  fromName: string;          // Sender name (e.g., 'HOSPProject Team')
}

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateName?: string;
  templateData?: any;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:3000/api/email'; // Your backend email API endpoint

  constructor(private http: HttpClient) {}

  /**
   * Send verification email to newly registered user
   */
  sendVerificationEmail(email: string, username: string, verificationToken: string): Observable<EmailResponse> {
    const verificationLink = `${window.location.origin}/verify-email?token=${verificationToken}`;

    const emailData: EmailData = {
      to: email,
      subject: 'Verify Your HOSPProject Account',
      html: this.getVerificationEmailTemplate(username, verificationLink),
      text: `Hello ${username}, Please verify your email by clicking this link: ${verificationLink}`
    };

    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Send welcome email after email verification
   */
  sendWelcomeEmail(email: string, username: string): Observable<EmailResponse> {
    const emailData: EmailData = {
      to: email,
      subject: 'Welcome to HOSPProject!',
      html: this.getWelcomeEmailTemplate(username),
      text: `Welcome to HOSPProject, ${username}! We're excited to have you on board.`
    };

    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Send password reset email
   */
  sendPasswordResetEmail(email: string, username: string, resetToken: string): Observable<EmailResponse> {
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    const emailData: EmailData = {
      to: email,
      subject: 'Reset Your HOSPProject Password',
      html: this.getPasswordResetTemplate(username, resetLink),
      text: `Hello ${username}, Click this link to reset your password: ${resetLink}`
    };

    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Generic send email method
   */
  sendEmail(emailData: EmailData): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, emailData);
  }

  // Email Templates

  private getVerificationEmailTemplate(username: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HOSPProject</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${username}!</h2>
            <p>Thank you for registering with HOSPProject. Please verify your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 HOSPProject. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HOSPProject!</h1>
          </div>
          <div class="content">
            <h2>Hello, ${username}!</h2>
            <p>Your email has been verified successfully. Welcome to the HOSPProject community!</p>
            <p>You can now access all features of your account:</p>
            <ul>
              <li>Manage appointments</li>
              <li>View medical records</li>
              <li>Connect with healthcare providers</li>
              <li>Access health resources</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 HOSPProject. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(username: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello, ${username}</h2>
            <p>We received a request to reset your password for your HOSPProject account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetLink}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 HOSPProject. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
