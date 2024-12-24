import { AppError } from '../utils/errors.js';

export const validateContent = (req, res, next) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return next(
      new AppError('Content is required and must be a non-empty string', 400)
    );
  }
  next();
};

export const validateMessages = (req, res, next) => {
  const { messages } = req.body;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every((msg) => typeof msg === 'string')
  ) {
    return next(
      new AppError('Messages must be a non-empty array of strings', 400)
    );
  }
  next();
};
