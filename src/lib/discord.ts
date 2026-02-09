interface OrderNotificationProps {
  orderId: string;
  email: string;
  username: string;
  platform: string;
  followers: number;
  price: string;
  promoCode?: string;
}

export async function sendDiscordOrderNotification({
  orderId,
  email,
  username,
  platform,
  followers,
  price,
  promoCode,
}: OrderNotificationProps) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not configured. Discord notifications will not be sent.');
    return { success: false, error: 'Discord webhook not configured' };
  }

  const platformEmoji = platform.toLowerCase() === 'instagram' ? '📸' : '🎵';
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  const embed = {
    title: '🎉 Nouvelle Commande !',
    color: 0x8B5CF6, // Purple
    fields: [
      {
        name: '📧 Email',
        value: email,
        inline: true,
      },
      {
        name: '👤 Username',
        value: `@${username}`,
        inline: true,
      },
      {
        name: `${platformEmoji} Plateforme`,
        value: platformName,
        inline: true,
      },
      {
        name: '👥 Followers',
        value: `+${followers.toLocaleString()}`,
        inline: true,
      },
      {
        name: '💰 Prix',
        value: price,
        inline: true,
      },
      {
        name: '🆔 Order ID',
        value: `\`${orderId}\``,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Spotyz',
    },
  };

  // Add promo code field if used
  if (promoCode) {
    embed.fields.push({
      name: '🏷️ Code Promo',
      value: promoCode,
      inline: true,
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook error:', response.status, response.statusText);
      return { success: false, error: `Discord error: ${response.status}` };
    }

    console.log('Discord notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return { success: false, error };
  }
}
