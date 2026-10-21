import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/api.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// API routes
app.use(apiRouter);

// Serve static built frontend
const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[NDAO'AUTO] Server running on http://0.0.0.0:${PORT}`);
});
