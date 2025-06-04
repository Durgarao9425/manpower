const jwt = require('jsonwebtoken');

const generateToken = (data) => {
    try {
        return jwt.sign(data, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Failed to generate token');
    }
};

module.exports = {
    generateToken
};
