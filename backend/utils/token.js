const JWT = require('jsonwebtoken');

const accessToken = (user) => {
    return JWT.sign(
        {
            user: user._id,
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET, // 🌟 Yahan 'ACCESS' karna hai (double 'S')
        { expiresIn: "15m" }
    );
}

const refreshToken = (user) => {
    return JWT.sign(
        {
            user: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "15d" }
    );
}

module.exports = { accessToken, refreshToken };