'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
  const { name, email, message } = formData;

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' };
  }

  if (!email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    await resend.emails.send({
      from: 'MyStore Contact <onboarding@resend.dev>',
      to: process.env.STORE_OWNER_EMAIL!,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 80px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${email}" style="color: #f97316;">${email}</a>
              </td>
            </tr>
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <h3 style="color: #1e3a5f;">Message:</h3>
          <p style="line-height: 1.6; color: #444;">${message.replace(/\n/g, '<br/>')}</p>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            Sent from MyStore contact form. Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Contact email error:', error);
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    };
  }
}
