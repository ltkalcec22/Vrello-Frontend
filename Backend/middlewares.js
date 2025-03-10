const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'mysecretkey';


function authMiddleware(req, res, next) {
const excludedPaths = ['/login', '/signup'];
  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  // Očekujemo da je token u formatu "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // Iz tokena dohvaćamo user_id; ovdje pretpostavljamo da je spremljen kao "id"
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token or unauthorized' });
  }
}
module.exports = authMiddleware;
