var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cors = require('cors');

// Load env vars if not already set
if (!process.env.DB_TEST_URL || !process.env.DB_PROD_URL || !process.env.TOKEN_SECRET || !process.env.GOOGLE_AUTH) {
    var config = require('../config/env');
} else {
    var fs = require('fs');
    fs.writeFileSync('./config/google-auth.json', process.env.GOOGLE_AUTH, 'utf-8');
}

/* DB connection */
var URL;
switch(process.env.NODE_ENV) {
    case 'development':
    URL = process.env.DB_DEV_URL;
    break;

    case 'test':
    URL = process.env.DB_TEST_URL;
    break;

    case 'production':
    URL = process.env.DB_PROD_URL;
    break;

    case 'default':
    URL = process.env.DB_DEV_URL;
    break;
}
mongoose.connect(URL, { server: { reconnectTries: Number.MAX_VALUE } });

/* Express application setup */
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan('combined'))

/* Enabling CORS */
app.use(cors());
app.set('tokenSecret', process.env.TOKEN_SECRET);

app.use(function(req, res, next) {
    req.static = express.static('public');
    next();
});

/* Routing */
app.use('/', require('./routes/base'));
app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/comments', require('./routes/comments'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/instagram', require('./routes/instagram'));
app.use('/posts', require('./routes/posts'));
app.use('/settings', require('./routes/settings'));
app.use('/stats', require('./routes/stats'));
app.use('/users', require('./routes/users'));

/* 404 */
app.use(function(req, res, next) {
    res.status(404).json({ status: 'NOT_FOUND', message: 'ENDPOINT_DOES_NOT_EXIST' });
});

app.listen(3000);

module.exports = app;
