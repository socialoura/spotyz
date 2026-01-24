import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Create pricing table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS pricing (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create admin table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        platform VARCHAR(50) NOT NULL,
        followers INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'completed',
        payment_intent_id VARCHAR(255),
        payment_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'completed',
        order_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add order_status and notes columns if they don't exist (for existing tables)
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`;
    } catch (e) {
      // Columns might already exist
      console.log('Columns may already exist:', e);
    }
    
    // Create settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_username ON orders(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email ON orders(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON orders(created_at)`;
    
    // Create promo_codes table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        max_uses INTEGER DEFAULT NULL,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP DEFAULT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add promo_code column to orders if it doesn't exist
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50) DEFAULT NULL`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0`;
    } catch (e) {
      console.log('Promo columns may already exist:', e);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function getPricing() {
  try {
    const result = await sql`
      SELECT data FROM pricing WHERE id = 'pricing-data'
    `;
    
    if (result.rows.length > 0) {
      return result.rows[0].data as { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }> };
    }
    return null;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return null;
  }
}

export async function setPricing(data: { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }> }) {
  try {
    await sql`
      INSERT INTO pricing (id, data) 
      VALUES ('pricing-data', ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (id) 
      DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error setting pricing:', error);
    throw error;
  }
}

export async function getAdminByUsername(username: string) {
  try {
    const result = await sql`
      SELECT * FROM admin_users WHERE username = ${username}
    `;
    
    if (result.rows.length > 0) {
      return result.rows[0] as { id: number; username: string; password: string };
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function updateAdminPassword(username: string, newPassword: string) {
  try {
    await sql`
      INSERT INTO admin_users (username, password) 
      VALUES (${username}, ${newPassword})
      ON CONFLICT (username) 
      DO UPDATE SET password = ${newPassword}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error updating admin password:', error);
    throw error;
  }
}

export async function createOrder(data: {
  email: string;
  platform: string;
  followers: number;
  price: number;
  payment_intent_id?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO orders (email, platform, followers, price, payment_intent_id, amount, username) 
      VALUES (${data.email}, ${data.platform}, ${data.followers}, ${data.price}, ${data.payment_intent_id || null}, ${data.price}, ${data.email})
      RETURNING id
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderPaymentStatus(payment_intent_id: string, status: string) {
  try {
    await sql`
      UPDATE orders SET payment_status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = ${payment_intent_id}
    `;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const result = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getStripeSettings() {
  try {
    const secretResult = await sql`
      SELECT value FROM settings WHERE key = 'stripe_secret_key'
    `;
    const publishableResult = await sql`
      SELECT value FROM settings WHERE key = 'stripe_publishable_key'
    `;
    
    return {
      secretKey: secretResult.rows.length > 0 ? secretResult.rows[0].value : null,
      publishableKey: publishableResult.rows.length > 0 ? publishableResult.rows[0].value : null,
    };
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    return { secretKey: null, publishableKey: null };
  }
}

export async function getPromoEnabled(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT value FROM settings WHERE key = 'promo_enabled'
    `;
    return result.rows.length > 0 ? result.rows[0].value === 'true' : true; // Default to true
  } catch (error) {
    console.error('Error fetching promo enabled setting:', error);
    return true;
  }
}

export async function setPromoEnabled(enabled: boolean): Promise<void> {
  try {
    await sql`
      INSERT INTO settings (key, value) 
      VALUES ('promo_enabled', ${enabled ? 'true' : 'false'})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${enabled ? 'true' : 'false'}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error setting promo enabled:', error);
    throw error;
  }
}

export async function updateStripeSettings(secretKey: string, publishableKey: string) {
  try {
    // Update or insert secret key
    await sql`
      INSERT INTO settings (key, value) 
      VALUES ('stripe_secret_key', ${secretKey})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${secretKey}, updated_at = CURRENT_TIMESTAMP
    `;
    
    // Update or insert publishable key
    await sql`
      INSERT INTO settings (key, value) 
      VALUES ('stripe_publishable_key', ${publishableKey})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${publishableKey}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error updating Stripe settings:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: number, orderStatus: string) {
  try {
    await sql`
      UPDATE orders SET order_status = ${orderStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function updateOrderNotes(orderId: number, notes: string) {
  try {
    await sql`
      UPDATE orders SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;
  } catch (error) {
    console.error('Error updating order notes:', error);
    throw error;
  }
}

export async function getOrderById(orderId: number) {
  try {
    const result = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Promo Codes Functions
export interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  try {
    const result = await sql`
      SELECT * FROM promo_codes ORDER BY created_at DESC
    `;
    return result.rows as PromoCode[];
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return [];
  }
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  try {
    const result = await sql`
      SELECT * FROM promo_codes WHERE UPPER(code) = UPPER(${code})
    `;
    return result.rows.length > 0 ? result.rows[0] as PromoCode : null;
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return null;
  }
}

export async function createPromoCode(data: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number | null;
  expires_at?: string | null;
}): Promise<PromoCode | null> {
  try {
    const result = await sql`
      INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, expires_at)
      VALUES (${data.code.toUpperCase()}, ${data.discount_type}, ${data.discount_value}, ${data.max_uses || null}, ${data.expires_at || null})
      RETURNING *
    `;
    return result.rows[0] as PromoCode;
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
}

export async function updatePromoCode(id: number, data: {
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
}): Promise<void> {
  try {
    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    
    if (data.code !== undefined) {
      updates.push('code = $' + (values.length + 1));
      values.push(data.code.toUpperCase());
    }
    if (data.discount_type !== undefined) {
      updates.push('discount_type = $' + (values.length + 1));
      values.push(data.discount_type);
    }
    if (data.discount_value !== undefined) {
      updates.push('discount_value = $' + (values.length + 1));
      values.push(data.discount_value);
    }
    if (data.max_uses !== undefined) {
      updates.push('max_uses = $' + (values.length + 1));
      values.push(data.max_uses);
    }
    if (data.expires_at !== undefined) {
      updates.push('expires_at = $' + (values.length + 1));
      values.push(data.expires_at);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = $' + (values.length + 1));
      values.push(data.is_active);
    }
    
    if (updates.length > 0) {
      await sql.query(
        `UPDATE promo_codes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
        [...values, id]
      );
    }
  } catch (error) {
    console.error('Error updating promo code:', error);
    throw error;
  }
}

export async function deletePromoCode(id: number): Promise<void> {
  try {
    await sql`DELETE FROM promo_codes WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting promo code:', error);
    throw error;
  }
}

export async function validatePromoCode(code: string): Promise<{ valid: boolean; promoCode?: PromoCode; error?: string }> {
  try {
    const promoCode = await getPromoCodeByCode(code);
    
    if (!promoCode) {
      return { valid: false, error: 'Code promo invalide' };
    }
    
    if (!promoCode.is_active) {
      return { valid: false, error: 'Ce code promo n\'est plus actif' };
    }
    
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return { valid: false, error: 'Ce code promo a expiré' };
    }
    
    if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
      return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' };
    }
    
    return { valid: true, promoCode };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Erreur lors de la validation du code' };
  }
}

export async function incrementPromoCodeUsage(code: string): Promise<void> {
  try {
    await sql`
      UPDATE promo_codes 
      SET current_uses = current_uses + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE UPPER(code) = UPPER(${code})
    `;
  } catch (error) {
    console.error('Error incrementing promo code usage:', error);
    throw error;
  }
}

export function calculateDiscount(price: number, promoCode: PromoCode): number {
  if (promoCode.discount_type === 'percentage') {
    return price * (Number(promoCode.discount_value) / 100);
  } else {
    return Math.min(Number(promoCode.discount_value), price);
  }
}
