var express = require('express');
var router = express.Router();
var Setting = require('../models/setting');
var auth = require('../etc/authentication.js');

router.get('/', function(req, res) {
    Setting.find({}).exec(function(err, settings) {
        if (err) {
            res.status(500).send('Could not get settings. Error: ' + err);
        } else {
            res.json(settings);
        }
    });
});

router.post('/', auth, function(req, res) {
    var key = req.body.key;
    var value = req.body.value;

    Setting.update({ key: key }, { key: key, value: value }, { upsert: true }, function(err, setting) {
        if (err) {
            res.status(500).send('Could not create settings. Error: ' + err);
        } else {
            res.json(setting);
        }
    });
});

module.exports = router;
