import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { AppError } from '../utils/errors.js';

const TIMEOUT = 5000; // 5 seconds timeout
const MAX_REDIRECTS = 5;

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const fetchWithTimeout = async (url, options = {}) => {
  // if (redirectCount >= MAX_REDIRECTS) {
  //   throw new AppError('Too many redirects', 400);
  // }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        ...options.headers,
      },
    });

    // Handle redirects manually if needed
    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        return fetchWithTimeout(location, options, redirectCount + 1);
      }
    }

    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return fetch(url, {
      ...options,
      redirect: 'follow', // Default is 'manual', set to 'follow' for redirects
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
  } finally {
    clearTimeout(timeout);
  }
};

const extractMetadata = (document, url) => {
  const getContent = (selectors) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const content = element?.content || element?.textContent;
      if (content?.trim()) return content.trim();
    }
    return '';
  };
  // Special handling for different platforms
  const urlObj = new URL(url);
  const domain = urlObj.hostname.toLowerCase();
  // Instagram 특수 처리
  if (domain.includes('instagram.com')) {
    return {
      title: 'Instagram Post',
      description: getContent(['meta[property="og:description"]']),
      thumbnail: getContent(['meta[property="og:image"]']),
    };
  }
  // Naver Blog handling
  if (domain.includes('blog.naver.com')) {
    const iframe = document.querySelector('#mainFrame');
    if (iframe) {
      const blogUrl = iframe.src;
      return fetchMetadata(blogUrl); // Recursive call for the actual blog content
    }
  }

  const title =
    getContent([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
      'h1',
    ]) || domain;

  const description = getContent([
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    'meta[name="description"]',
  ]);

  let thumbnail = getContent([
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="og:image:secure_url"]',
    'meta[property="og:image:url"]',
  ]);
  // 상대 경로를 절대 경로로 변환
  if (thumbnail && !thumbnail.startsWith('http')) {
    try {
      thumbnail = new URL(thumbnail, urlObj.origin).toString();
    } catch {
      thumbnail = '';
    }
  }

  return { title, description, thumbnail };
};

export const fetchMetadata = async (url) => {
  if (!isValidUrl(url)) {
    throw new AppError('Invalid URL', 400);
  }
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    if (response.status === 404) {
      console.warn(`URL not found (404): ${url}`);
      return { title: 'Page Not Found', description: '', keywords: [] };
    }
    return extractMetadata(dom.window.document, url);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    if (error.statusCode === 404) {
      return {
        title: 'Resource Not Found',
        description: 'The content could not be retrieved.',
        thumbnail: null,
      };
    }
    if (error.name === 'AbortError') {
      throw new AppError('Request timeout', 408);
    }
    const urlObj = new URL(url);

    // Return empty metadata instead of throwing
    return {
      title: urlObj.hostname,
      description: '',
      thumbnail: null,
    };
  }
};
