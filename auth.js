const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'change_me';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, secret);
    req.user = payload; // { id, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = auth;