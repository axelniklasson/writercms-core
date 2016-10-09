var express = require('express');
var router = express.Router();
var auth = require('../etc/authentication.js');

router.get('/', function(req, res) {
    res.json({
        name: 'WriterCMS API',
        version: 'v1',
        author: 'Axel Niklasson <hello@axelniklasson.se>'
    });
});

module.exports = router;
