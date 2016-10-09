var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var Post = require('../models/post');
var User = require('../models/user');
var moment = require('moment');
var auth = require('../etc/authentication.js');

/* Get all users */
router.get('/', auth, function(req, res) {
    Post.find({}).exec(function(err, posts) {
        if (err) {
            res.status(500).send('Could not get posts. Error: ' + err);
        } else {
            var days = moment(new Date()).diff(moment(posts[0].date), 'days') + 1;
            var status = {
                postsPerDay:  Math.round((posts.length / days) * 100) / 100
            };

            var nbrOfCategories = 0;
            for (var i = 0; i < posts.length; i++) {
                nbrOfCategories += posts[i].categories.length;
            }

            status.avgNbrCategories = Math.round((nbrOfCategories / posts.length) * 100) / 100;

            Post.aggregate([
                {
                    '$group': {
                        '_id': '$author',
                        'count': { '$sum': 1 }
                    }
                }
            ], function(err, result) {
                if (err) {
                    res.status(500).send('Could not aggregate posts. Error: ' + err);
                } else {
                    var topWriter = { share: posts.length / result[0].count };

                    User.findOne({ _id: result[0]._id }, function(err, user) {
                        if (err) {
                            res.status(500).send('Could not get user. Error: ' + err);
                        } else {
                            topWriter.name = user.firstName;
                            status.topWriter = topWriter;
                            res.json(status);
                        }
                    })
                }
            });
        }
    });
});

module.exports = router;
