import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimit.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const spaIndex = path.join(frontendDist, 'index.html');
const serveSpa = fs.existsSync(spaIndex);

app.set('trust proxy', 1);

// Security headers. CSP is relaxed enough for the Vite SPA (same-origin JS/CSS).
app.use(
  helmet({
    contentSecurityPolicy: serveSpa
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
            fontSrc: ["'self'", 'data:'],
            frameSrc: ["'self'", 'https:'],
          },
        }
      : undefined,
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS — allow the configured frontend origins
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server / curl (no Origin header)
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (!config.isProd) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', globalLimiter);

// Load balancers / AWS health checks
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api', apiRouter);

// Production: one process serves the React app + API (same origin, no CORS needed).
if (serveSpa) {
  app.use(express.static(frontendDist, { index: false, maxAge: '1d' }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(spaIndex);
  });
} else {
  app.get('/', (_req, res) =>
    res.json({ name: 'The Physiotherapy Clinic API', status: 'ok', hint: 'Build the frontend (npm run build) to serve the website from this process.' }),
  );
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
