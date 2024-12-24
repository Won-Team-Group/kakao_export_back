import express from 'express';
import { catchAsync } from '../utils/errors.js';
import fetch from 'node-fetch';

const router = express.Router();

const FORMSPARK_ENDPOINT = 'https://submit-form.com';

router.post(
  '/',
  catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const response = await fetch(
      `${FORMSPARK_ENDPOINT}/${process.env.FORMSPARK_FORM_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit to FormSpark');
    }

    res.json({ success: true });
  })
);

export { router as waitlistRouter };
