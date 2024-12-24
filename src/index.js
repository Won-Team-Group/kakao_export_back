import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { openaiRouter } from './routes/openai.js';
import { metadataRouter } from './routes/metadata.js';
import { config } from './config/env.js';
import { AppError } from './utils/errors.js';
import { waitlistRouter } from './routes/waitlist.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['POST'],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json());

app.use('/api/openai', openaiRouter);
app.use('/api/metadata', metadataRouter);
// Add this line with other route definitions
app.use('/api/waitlist', waitlistRouter);

app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
