import express from 'express';
import { fetchMetadata } from '../services/metadata.js';
import { catchAsync } from '../utils/errors.js';

const router = express.Router();

router.post(
  '/',
  catchAsync(async (req, res) => {
    const { url } = req.body;
    const metadata = await fetchMetadata(url);
    res.json(metadata);
  })
);

export { router as metadataRouter };
