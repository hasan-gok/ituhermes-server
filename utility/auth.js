const jwt = require('jsonwebtoken');
const auth = {};
auth.createJWTToken = (options) => {
    if (typeof options !== 'object') {
        options = {};
    }
    if (!options.timeout) {
        options.timeout = 15 * 24 * 60 * 60; // 15 days.
    }
    return jwt.sign({
        data: options.sessionData
    }, process.env.JWT_SECRET, {
        expiresIn: options.timeout,
        algorithm: 'HS256'
    });
};

auth.verifyJWTToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            return resolve(decoded);
        });
    });
};
auth.jwt_middleware = (req, res, next) => {
    let token = req.query.token;
    if (!token) {
        res.sendStatus(401);
        return next();
    }
    auth.verifyJWTToken(token)
        .then((decodedToken) => {
            req.user = decodedToken.data;
            return next();
        }).catch(next);
};
module.exports = auth;