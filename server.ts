import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { globalErrorHandler } from './server/middleware/errors.ts';
import { tenantContext } from './server/db/index.ts';
import { nexusContext } from './server/middleware/context.ts';
import { seed } from './server/db/seed.ts';

// Route Imports
import { insuranceRouter } from './server/routes/insurance.routes.ts';
import { retailRouter } from './server/routes/retail.routes.ts';
import { treasuryRouter } from './server/routes/treasury.ts';
import { workingCapitalRouter } from './server/routes/working-capital.routes.ts';
import { adminRouter } from './server/routes/admin.ts';
import { verticalsRouter } from './server/routes/verticals.ts';
import { dashboardRouter } from './server/routes/user-dashboard.ts';
import { devRouter } from './server/routes/dev.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = process.cwd();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Run database migrations/seeding
  await seed();

  app.use(express.json());
  app.use(cors());

  // RLS Middleware: Extracts identity and binds to AsyncLocalStorage
  app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] as string || 't-1';
    const userRole = req.headers['x-user-role'] as string || 'ADMIN';
    tenantContext.run({ tenantId }, () => {
      nexusContext.run(new Map([
        ['tenantId', tenantId],
        ['userRole', userRole],
      ]), () => next());
    });
  });

  // API Routing Table
  const apiRouter = express.Router();
  
  apiRouter.use(treasuryRouter);
  apiRouter.use('/insurance', insuranceRouter);
  apiRouter.use('/retail', retailRouter);
  apiRouter.use('/working-capital', workingCapitalRouter);
  apiRouter.use('/admin', adminRouter);
  apiRouter.use('/dashboard', dashboardRouter);
  apiRouter.use('/dev', devRouter);
  apiRouter.use(verticalsRouter);

  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      configFile: false,
      root: appRoot,
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      },
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(appRoot, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler must be last
  app.use(globalErrorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production Hardened Nexus Server running on port ${PORT}`);
    console.log(`NEXUS_BACKEND: Persistence Layer Activated [v4.3.0]`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL_STARTUP_ERROR:", err);
  process.exit(1);
});
