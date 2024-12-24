import express from 'express';
import {
  generateTitle,
  generateTags,
  generateSummary,
} from '../services/openai.js';
import { catchAsync } from '../utils/errors.js';
import { validateContent, validateMessages } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/generate-title',
  validateContent,
  catchAsync(async (req, res) => {
    const { content } = req.body;
    const title = await generateTitle(content);
    res.json({ title });
  })
);

router.post(
  '/generate-tags',
  validateContent,
  catchAsync(async (req, res) => {
    const { content } = req.body;
    console.log('Generating tags for content:', content);
    const tags = await generateTags(content);
    console.log('Generated tags:', tags);
    res.json({ tags });
  })
);

router.post(
  '/generate-summary',
  validateMessages,
  catchAsync(async (req, res) => {
    const { messages } = req.body;
    const summary = await generateSummary(messages);
    res.json({ summary });
  })
);

export { router as openaiRouter };
