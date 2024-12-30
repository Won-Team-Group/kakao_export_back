import OpenAI from 'openai';
import { config } from '../config/env.js';
import { OPENAI_CONSTANTS } from '../constants/openai.js';
import { AppError } from '../utils/errors.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// export const generateTitle = async (content) => {
//   console.log(openai.apiKey);
//   try {
//     const response = await openai.chat.completions.create({
//       model: OPENAI_CONSTANTS.MODEL,
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a helpful assistant that generates concise titles for text content. Keep titles under 50 characters.',
//         },
//         {
//           role: 'user',
//           content: `Generate a title for this content: ${content}`,
//         },
//       ],
//       temperature: OPENAI_CONSTANTS.TEMPERATURE,
//       max_tokens: OPENAI_CONSTANTS.MAX_TOKENS.TITLE,
//     });
//     // console.log('제목', response);

//     return response.choices[0].message.content?.trim() || '제목 없음';
//   } catch (error) {
//     throw new AppError('Failed to generate title from OpenAI', 500);
//   }
// };

export const generateTags = async (content) => {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONSTANTS.MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Analyze the title, description, and content(html "body" or "article" tag) of the link to create 2-3 suitable tags. The generated tags should be written in the same language as the content language as much as possible. Examples: "프로그래밍", "AI", "디자인", etc. When you create tags, you should actively utilize already created tags. However, if there is no tag suitable for "content" among the tags used so far, new tags should be created.Return only the tags separated by commas, without any additional text.',
        },
        {
          role: 'user',
          content: `Please analyze the following content to generate tags: ${content}`,
        },
      ],
      temperature: OPENAI_CONSTANTS.TEMPERATURE,
      max_tokens: OPENAI_CONSTANTS.MAX_TOKENS.TAGS,
    });
    // console.log('태그원', response);

    const tags = response.choices[0].message.content
      ?.split(',')
      .map((tag) => tag.trim());
    // console.log('태그', tags);
    return tags.length > 0 ? tags : ['기타'];
  } catch (error) {
    throw new AppError('Failed to generate tags from OpenAI', 500);
  }
};

// export const generateSummary = async (messages) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: OPENAI_CONSTANTS.MODEL,
//       messages: [
//         {
//           role: 'system',
//           content:
//             'Summarize the common themes and insights from the given messages in 2-3 sentences in Korean.',
//         },
//         {
//           role: 'user',
//           content: `Summarize these related messages: ${messages.join('\n\n')}`,
//         },
//       ],
//       temperature: OPENAI_CONSTANTS.TEMPERATURE,
//       max_tokens: OPENAI_CONSTANTS.MAX_TOKENS.SUMMARY,
//     });

//     return response.choices[0].message.content?.trim() || '';
//   } catch (error) {
//     throw new AppError('Failed to generate summary from OpenAI', 500);
//   }
// };
