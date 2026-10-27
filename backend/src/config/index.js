import dotenv from 'dotenv';

dotenv.config();

const bool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: Number(process.env.PORT) || 4000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  db: {
    // 'pg' = external PostgreSQL server, 'pglite' = embedded in-process Postgres.
    driver: (process.env.DB_DRIVER || 'pg').toLowerCase(),
    // Directory where the embedded PGlite database is persisted.
    pgliteDir: process.env.PGLITE_DIR || '',
    connectionString: process.env.DATABASE_URL || '',
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'physiotherapy',
    ssl: bool(process.env.PGSSL, false),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'The Physiotherapy Clinic <no-reply@physiotherapyclinic.example>',
    // Email is only attempted when a real SMTP host is set, or when the dev
    // Ethereal preview is explicitly enabled. Keeps the app fast on networks
    // that block outbound SMTP (no hanging connection attempts).
    preview: bool(process.env.EMAIL_PREVIEW, false),
    get enabled() {
      return Boolean(this.host) || this.preview;
    },
  },

  sms: {
    // Twilio credentials — power SMS, WhatsApp and voice calls over HTTPS.
    accountSid: process.env.SMS_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.SMS_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN || '',
    from: process.env.SMS_FROM || process.env.TWILIO_SMS_FROM || '',
    // WhatsApp-enabled sender, e.g. +14155238886 (Twilio sandbox) — no "whatsapp:" prefix.
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
    // Voice-capable caller ID for automated calls (defaults to SMS_FROM).
    callFrom: process.env.TWILIO_CALL_FROM || process.env.SMS_FROM || '',
  },

  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY || '',
    serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || '',
    listId: process.env.MAILCHIMP_LIST_ID || '',
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@physioclinic.example',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
};

export default config;
