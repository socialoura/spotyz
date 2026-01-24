import { Resend } from 'resend';

// Initialize Resend only when API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Emails will not be sent.');
    return null;
  }
  return new Resend(apiKey);
};

interface OrderConfirmationEmailProps {
  to: string;
  customerName?: string;
  orderDetails: {
    platform: string;
    followers: number;
    price: string;
    orderId: string;
    date: string;
  };
  language?: 'en' | 'fr';
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderDetails,
  language = 'en',
}: OrderConfirmationEmailProps) {
  const isEnglish = language === 'en';

  const subject = isEnglish
    ? `Order Confirmation - SocialOura #${orderDetails.orderId}`
    : `Confirmation de commande - SocialOura #${orderDetails.orderId}`;

  const platformName = orderDetails.platform.charAt(0).toUpperCase() + orderDetails.platform.slice(1);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                SocialOura
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${isEnglish ? 'Order Confirmation' : 'Confirmation de commande'}
              </p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; line-height: 80px;">
                <span style="color: #ffffff; font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px; text-align: center;">
              <h2 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                ${isEnglish ? 'Thank you for your order!' : 'Merci pour votre commande !'}
              </h2>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                ${isEnglish 
                  ? `Hi${customerName ? ` ${customerName}` : ''}, your payment has been successfully processed.`
                  : `Bonjour${customerName ? ` ${customerName}` : ''}, votre paiement a été traité avec succès.`
                }
              </p>
            </td>
          </tr>

          <!-- Order Details Box -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 20px; color: #374151; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
                      ${isEnglish ? 'Order Details' : 'Détails de la commande'}
                    </h3>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                          ${isEnglish ? 'Order ID' : 'N° de commande'}
                        </td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">
                          #${orderDetails.orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                          ${isEnglish ? 'Date' : 'Date'}
                        </td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">
                          ${orderDetails.date}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                          ${isEnglish ? 'Platform' : 'Plateforme'}
                        </td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">
                          ${platformName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">
                          ${isEnglish ? 'Followers' : 'Abonnés'}
                        </td>
                        <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">
                          +${orderDetails.followers.toLocaleString()}
                        </td>
                      </tr>
                      <tr style="border-top: 2px solid #e5e7eb;">
                        <td style="padding: 15px 0 0; color: #374151; font-size: 16px; font-weight: 600;">
                          ${isEnglish ? 'Total' : 'Total'}
                        </td>
                        <td style="padding: 15px 0 0; color: #8B5CF6; font-size: 20px; font-weight: 700; text-align: right;">
                          ${orderDetails.price}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Box -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #EEF2FF; border-radius: 12px; border-left: 4px solid #8B5CF6;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #4338CA; font-size: 14px; line-height: 1.6;">
                      <strong>${isEnglish ? 'What happens next?' : 'Et maintenant ?'}</strong><br>
                      ${isEnglish 
                        ? 'Your order is being processed. You will start seeing results within 24-48 hours. The delivery will be gradual to ensure natural growth.'
                        : 'Votre commande est en cours de traitement. Vous commencerez à voir les résultats dans les 24 à 48 heures. La livraison sera progressive pour assurer une croissance naturelle.'
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                ${isEnglish ? 'Questions? Contact us at' : 'Des questions ? Contactez-nous à'}
                <a href="mailto:support@socialoura.com" style="color: #8B5CF6; text-decoration: none;"> support@socialoura.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} SocialOura. ${isEnglish ? 'All rights reserved.' : 'Tous droits réservés.'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const resend = getResend();
    
    if (!resend) {
      console.warn('Email not sent: RESEND_API_KEY is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'SocialOura <noreply@socialoura.com>',
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
