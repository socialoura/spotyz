import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, email, language } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!email || email === 'Non fourni' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 }
      );
    }

    const supportEmail = process.env.SUPPORT_EMAIL || 'support@spotyz.com';
    const timestamp = new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send email notification
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      await resend.emails.send({
        from: 'Spotyz Support <noreply@spotyz.com>',
        to: [supportEmail],
        subject: `💬 New Support Message from ${email}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: system-ui, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">💬 New Support Message</h1>
    </div>
    <div style="padding: 24px;">
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">📧 Customer Email</p>
        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${email}</p>
      </div>
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">🌐 Language</p>
        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${language === 'fr' ? 'Français' : 'English'}</p>
      </div>
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">🕐 Date & Time</p>
        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${timestamp}</p>
      </div>
      <div style="background: #EEF2FF; border-radius: 8px; padding: 16px; border-left: 4px solid #8B5CF6;">
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">💬 Message</p>
        <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">${message}</p>
      </div>
      ${email !== 'Non fourni' ? `
      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Reply to Customer
        </a>
      </div>
      ` : ''}
    </div>
    <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">Spotyz Support System</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    }

    // Send Discord notification
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '💬 New Support Message',
            color: 0x3B82F6,
            fields: [
              { name: '📧 Email', value: email, inline: true },
              { name: '🌐 Language', value: language === 'fr' ? 'Français' : 'English', inline: true },
              { name: '💬 Message', value: message.length > 1000 ? message.substring(0, 1000) + '...' : message, inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Spotyz Support' },
          }],
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in support-message API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
