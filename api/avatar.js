const crypto = require('crypto');

function normalizeEmail(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

function getEmailFromRequest(req) {
  const url = new URL(req.url || '/', 'https://example.com');
  const query = url.searchParams;

  const emailFromQuery =
    query.get('email') ||
    query.get('mail') ||
    query.get('user') ||
    query.get('query');

  if (emailFromQuery) {
    return normalizeEmail(emailFromQuery);
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length > 1) {
    const candidate = pathParts[pathParts.length - 1];
    if (candidate.includes('@')) {
      return normalizeEmail(candidate);
    }
  }

  return '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function gravatarUrl(email) {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=512&d=mp&r=g`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Only GET requests are allowed.'
    });
    return;
  }

  const email = getEmailFromRequest(req);

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email. Example: /api/avatar?email=hello@example.com',
      example: '/api/avatar?email=hello@example.com'
    });
  }

  const avatar = gravatarUrl(email);

  return res.status(200).json({
    success: true,
    email,
    avatar,
    avatar_url: avatar,
    pfp: avatar,
    profile_picture: avatar,
    provider: 'gravatar',
    source: 'email hash'
  });
};
