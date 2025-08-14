# Email Template with Logo - Backend Implementation Guide

Great news that the emails are working! To add the PraktijkEPD logo to the email templates, the backend needs to be updated. Here's what needs to be done:

## Logo URLs to Use

The PraktijkEPD logo is hosted on Cloudinary:
- **PNG Version (Best for Emails)**: `https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png`
- **SVG Version**: `https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154559/PraktijkEPD-3-logoo_jlagdx.svg`

## Email Template Update

The backend email template should be updated to include the logo. Here's an example HTML email template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - PraktijkEPD</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #1e40af;
            padding: 30px;
            text-align: center;
        }
        .logo {
            max-width: 200px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
        }
        h1 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #2563eb;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .divider {
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        }
        .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Logo -->
        <div class="header">
            <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                 alt="PraktijkEPD Logo" 
                 class="logo" />
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1>Welcome to PraktijkEPD!</h1>
            
            <p>Hi {{firstName}},</p>
            
            <p>Thank you for creating an account with PraktijkEPD. To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            </div>
            
            <div class="info-box">
                <strong>Why verify your email?</strong><br>
                Email verification helps us ensure the security of your account and enables important communications about your healthcare journey.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">{{verificationUrl}}</p>
            
            <div class="divider"></div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Once verified, you can log in to your account</li>
                <li>Complete your profile information</li>
                <li>{{#if isClient}}Connect with your therapist{{/if}}</li>
                <li>{{#if isTherapist}}Start managing your clients{{/if}}</li>
                <li>{{#if isAdmin}}Access the admin dashboard{{/if}}</li>
                <li>{{#if isBookkeeper}}Manage invoices and financial reports{{/if}}</li>
            </ul>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Need help? Contact our support team at <a href="mailto:support@praktijkepd.nl">support@praktijkepd.nl</a></p>
            
            <p>Best regards,<br>The PraktijkEPD Team</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                 alt="PraktijkEPD" 
                 style="max-width: 120px; margin-bottom: 10px;" />
            <p>© 2025 PraktijkEPD. All rights reserved.</p>
            <p>This email was sent to {{email}}</p>
            <p>
                <a href="{{websiteUrl}}/privacy" style="color: #3b82f6;">Privacy Policy</a> | 
                <a href="{{websiteUrl}}/terms" style="color: #3b82f6;">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
```

## Plain Text Version (for email clients that don't support HTML)

```text
PraktijkEPD
===========

Welcome to PraktijkEPD!

Hi {{firstName}},

Thank you for creating an account with PraktijkEPD. To get started, please verify your email address by visiting the link below:

{{verificationUrl}}

Why verify your email?
Email verification helps us ensure the security of your account and enables important communications about your healthcare journey.

What happens next?
- Once verified, you can log in to your account
- Complete your profile information
{{#if isClient}}- Connect with your therapist{{/if}}
{{#if isTherapist}}- Start managing your clients{{/if}}
{{#if isAdmin}}- Access the admin dashboard{{/if}}
{{#if isBookkeeper}}- Manage invoices and financial reports{{/if}}

If you didn't create this account, please ignore this email.

Need help? Contact our support team at support@praktijkepd.nl

Best regards,
The PraktijkEPD Team

---
© 2025 PraktijkEPD. All rights reserved.
This email was sent to {{email}}
```

## Backend Implementation Steps

1. **Update Email Service Configuration**:
   ```javascript
   // email.service.js
   const sendVerificationEmail = async (user, verificationToken) => {
     const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;
     
     const emailData = {
       to: user.email,
       subject: 'Verify Your Email - PraktijkEPD',
       html: emailTemplate.replace(/{{firstName}}/g, user.firstName)
                          .replace(/{{email}}/g, user.email)
                          .replace(/{{verificationUrl}}/g, verificationUrl)
                          .replace(/{{websiteUrl}}/g, process.env.FRONTEND_URL),
       text: plainTextTemplate.replace(/{{firstName}}/g, user.firstName)
                              .replace(/{{email}}/g, user.email)
                              .replace(/{{verificationUrl}}/g, verificationUrl)
     };
     
     // Add role-specific content
     if (user.role === 'client') {
       emailData.html = emailData.html.replace(/{{#if isClient}}(.*?){{\/if}}/g, '$1');
     }
     // ... handle other roles
     
     await sendEmail(emailData);
   };
   ```

2. **Other Email Templates to Update**:
   - Password Reset Email
   - Appointment Confirmation Email
   - Invoice Email
   - Welcome Email (after verification)
   - Appointment Reminder Email

## Testing the Email Template

1. **Test with different email clients**:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile email apps

2. **Check logo display**:
   - Ensure the logo loads properly
   - Check alt text displays if images are blocked
   - Verify logo size is appropriate

3. **Test responsive design**:
   - Desktop view
   - Mobile view
   - Tablet view

## Additional Recommendations

1. **Image Hosting**: The Cloudinary URLs are reliable, but consider having a fallback
2. **Alt Text**: Always include descriptive alt text for the logo
3. **Inline CSS**: Use inline CSS for better email client compatibility
4. **Preheader Text**: Add preheader text for better email preview
5. **SPF/DKIM**: Ensure proper email authentication is set up

## Need Backend Access?

To implement these changes, you'll need to update the backend email templates. The files to modify are typically:
- `/src/services/email.service.js`
- `/src/templates/email/`
- `/src/config/email.config.js`

Would you like me to create a more detailed implementation guide for the backend developer?