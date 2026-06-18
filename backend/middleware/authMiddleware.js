import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized, token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
};

export default protect;