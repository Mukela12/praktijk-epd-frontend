# Backend Email Template Update Request

## Summary
Please update the email templates to include the PraktijkEPD logo and improve the overall design.

## Logo Assets
- **Primary Logo (PNG)**: `https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png`
- **Alternative Logo (SVG)**: `https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154559/PraktijkEPD-3-logoo_jlagdx.svg`

## Quick Implementation Code

### 1. Email Header with Logo
```html
<div style="background-color: #1e40af; padding: 30px; text-align: center;">
    <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
         alt="PraktijkEPD Logo" 
         style="max-width: 200px; height: auto;" />
</div>
```

### 2. Email Footer with Logo
```html
<div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280;">
    <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
         alt="PraktijkEPD" 
         style="max-width: 120px; margin-bottom: 10px;" />
    <p>© 2025 PraktijkEPD. All rights reserved.</p>
</div>
```

### 3. Complete Email Template Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background-color: #1e40af; padding: 30px; text-align: center;">
                            <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                                 alt="PraktijkEPD Logo" 
                                 style="max-width: 200px; height: auto;" />
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            {{content}}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                                 alt="PraktijkEPD" 
                                 style="max-width: 100px; margin-bottom: 10px;" />
                            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">© 2025 PraktijkEPD. All rights reserved.</p>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">
                                <a href="https://praktijkepd.nl/privacy" style="color: #3b82f6; text-decoration: none;">Privacy Policy</a> | 
                                <a href="https://praktijkepd.nl/terms" style="color: #3b82f6; text-decoration: none;">Terms of Service</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

## Email Templates to Update

1. **Email Verification** (`/templates/email-verification.html`)
2. **Password Reset** (`/templates/password-reset.html`)
3. **Welcome Email** (`/templates/welcome.html`)
4. **Appointment Confirmation** (`/templates/appointment-confirmation.html`)
5. **Invoice Email** (`/templates/invoice.html`)

## Brand Colors
- Primary Blue: `#1e40af`
- Secondary Blue: `#3b82f6`
- Light Background: `#f8fafc`
- Border Color: `#e5e7eb`
- Text Gray: `#6b7280`

## Testing Checklist
- [ ] Logo displays correctly in Gmail
- [ ] Logo displays correctly in Outlook
- [ ] Logo displays correctly on mobile devices
- [ ] Email is responsive on all screen sizes
- [ ] Alt text shows when images are blocked
- [ ] Links are working properly
- [ ] Email looks good in dark mode

## Example Update for Node.js/Express

```javascript
// emailTemplates.js
const verificationEmailTemplate = (firstName, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                        <!-- Logo Header -->
                        <tr>
                            <td style="background-color: #1e40af; padding: 30px; text-align: center;">
                                <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                                     alt="PraktijkEPD Logo" 
                                     style="max-width: 200px; height: auto;" />
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h1 style="color: #1e40af; font-size: 24px;">Welcome to PraktijkEPD!</h1>
                                <p>Hi ${firstName},</p>
                                <p>Please verify your email by clicking the button below:</p>
                                <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
                                    <tr>
                                        <td style="background-color: #3b82f6; padding: 14px 30px; border-radius: 8px;">
                                            <a href="${verificationUrl}" style="color: #ffffff; text-decoration: none; font-weight: bold;">
                                                Verify Email Address
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 20px; text-align: center;">
                                <img src="https://res.cloudinary.com/dizbrnm2l/image/upload/v1755154631/PraktijkEPD_logooo_ovl7xc.png" 
                                     alt="PraktijkEPD" 
                                     style="max-width: 100px;" />
                                <p style="color: #6b7280; font-size: 14px;">© 2025 PraktijkEPD. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

module.exports = { verificationEmailTemplate };
```

Please implement these changes in all email templates. Let me know if you need any clarification!