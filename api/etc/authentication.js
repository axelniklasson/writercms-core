module.exports = function auth(req, res, next) {
    var jwt = require('jsonwebtoken');
    var app = require('../server.js');

    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, app.get('tokenSecret'), function(err, decoded) {
            if (err) {
                return res.status(401).send('Invalid token.');
            } else {
                next();
            }
        });
    } else {
        return res.status(401).send('No token provided.');
    }
}
