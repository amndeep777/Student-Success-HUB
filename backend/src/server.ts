import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { connectDB } from './db/connection.js';
import { assertGovernanceApproved, enforceGovernanceRelease } from './middleware/governance.js';
import { demoAuth } from './middleware/auth.js';
import { governanceRouter } from './routes/governance.js';
import { consentRouter } from './routes/consents.js';
import { academicRouter } from './routes/academic.js';
import { flagsRouter } from './routes/flags.js';
import { notesRouter } from './routes/notes.js';
import { examsRouter } from './routes/exams.js';
import { interviewsRouter } from './routes/interviews.js';
import { paymentsRouter } from './routes/payments.js';
import { authRouter } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: config.corsOrigin as any }));
app.use(express.json());
app.use(demoAuth);
app.use(enforceGovernanceRelease);

app.get('/health', (_req, res) => res.json({ service: 'successhub-api', status: 'ok', environment: config.nodeEnv }));
app.get('/api/governance/status', (_req, res) => res.json({ environment: config.nodeEnv, productionBlockedUntilApproved: config.nodeEnv === 'production' }));
app.use('/api/auth', authRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/consents', consentRouter);
app.use('/api/academic', academicRouter);
app.use('/api/flags', flagsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup({ openapi: '3.0.3', info: { title: 'SuccessHUB API', version: '0.1.0' }, paths: {} }));

// Serve frontend static assets in production if build exists
const frontendCandidates = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
];
const frontendDist = frontendCandidates.find((dir) => fs.existsSync(dir));

if (frontendDist) {
  app.use(express.static(frontendDist));
  // Fallback for client-side routing on any unmatched GET request (compatible with Express 5)
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
}

async function start() {
  await connectDB();
  if (config.nodeEnv === 'production') {
    try {
      await assertGovernanceApproved();
      console.log('✓ Governance configurations verified.');
    } catch (err: any) {
      console.warn(`[WARNING] Governance pending approval: ${err.message}. Protected routes will return 503 until approved.`);
    }
  }
  app.listen(config.port, () => console.log(`SuccessHUB API listening on http://localhost:${config.port}`));
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
