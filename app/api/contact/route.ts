import { NextRequest } from 'next/server';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { nanoid } from 'nanoid';
import { withErrorHandler, parseRequestBody, createApiResponse, contactSchema } from '@/lib/api-utils';

// Email service (placeholder - would need actual email configuration)
async function sendEmailNotification(message: any) {
  // TODO: Implement email sending functionality
  // This would use nodemailer or another email service
  console.log('📧 Email notification would be sent:', message);

  // Example implementation:
  /*
  import nodemailer from 'nodemailer';

  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `New Contact Form Message: ${message.subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${message.name}</p>
      <p><strong>Email:</strong> ${message.email}</p>
      <p><strong>Company:</strong> ${message.company || 'N/A'}</p>
      <p><strong>Phone:</strong> ${message.phone || 'N/A'}</p>
      <p><strong>Website:</strong> ${message.website || 'N/A'}</p>
      <p><strong>Source:</strong> ${message.source || 'N/A'}</p>
      <p><strong>Newsletter:</strong> ${message.newsletter ? 'Yes' : 'No'}</p>
      <hr>
      <h3>Message:</h3>
      <p>${message.message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  */
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Parse and validate request body
  const { data: contactData, error: validationError } = await parseRequestBody(req, contactSchema);
  if (validationError) {
    return createApiResponse(null, validationError, 400);
  }

  // Create contact message
  const newMessage = {
    id: nanoid(),
    ...contactData,
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  };

  try {
    // Save to database
    const result = await db.insert(contactMessages).values(newMessage).returning();

    // Send email notification
    try {
      await sendEmailNotification(newMessage);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // We still return success since the message was saved
    }

    return createApiResponse(
      {
        id: result[0].id,
        message: 'Your message has been sent successfully. We\'ll get back to you soon!',
      },
      undefined,
      201
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return createApiResponse(null, 'Failed to submit message. Please try again later.', 500);
  }
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  // This endpoint would be for admin users to view contact messages
  // For now, we'll just return a success message for the form submission

  // In a real implementation, you would:
  // 1. Check if user is authenticated and has admin permissions
  // 2. Return paginated list of contact messages with filters
  // 3. Include ability to mark messages as read/replied

  return createApiResponse({ message: 'Contact form is working!' });
});