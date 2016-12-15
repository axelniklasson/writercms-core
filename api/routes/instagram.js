var express = require('express');
var request = require('request');
var router = express.Router();

/* Get public instagram feed of user (returns 9 latest posts) */
router.get('/feed/:username', function(req, res) {
    var username = req.params.username;
    var reqString = 'https://www.instagram.com/' + username + '/media/';
    request(reqString, function (error, response, body) {
        if (error) {
            res.status(500).send('Could not get user feed. Error: ' + error);
        } else {
            var feed = JSON.parse(body);
            feed.items.splice(9, 11);
            res.json(feed.items);
        }
    });
});

module.exports = router;
