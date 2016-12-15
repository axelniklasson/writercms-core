var express = require('express');
var request = require('request');
var router = express.Router();

/* Get public instagram feed of user */
router.get('/feed/:username', function(req, res) {
    var username = req.params.username;
    var reqString = 'https://www.instagram.com/' + username + '/media/';
    request(reqString, function (error, response, body) {
        if (error) {
            res.status(500).send('Could not get user feed. Error: ' + error);
        } else {
            res.send(body);
        }
    });
});

module.exports = router;
