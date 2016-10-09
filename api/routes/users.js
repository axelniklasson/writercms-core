var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../etc/authentication');
var bucketService = require('../etc/bucketService');

/* Get all users */
router.get('/', auth, function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            res.status(500).send('Could not get users. Error: ' + err);
        } else {
            res.json(users);
        }
    });
});

/* Get user by ID */
router.get('/:id', auth, function(req, res) {
    var ID = req.params.id;
    User.findOne({_id: ID}, function(err, user) {
        if (err) {
            res.status(500).send('Could not get user. Error: ' + err);
        } else {
            res.json(user);
        }
    });
});

/* Create a new user */
router.post('/', auth, function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = req.body.password;

    User.create({ firstName: firstName, lastName: lastName, username: username, password: password }, function(err, user) {
        if (err) {
            res.status(500).send('Could not create user. Error: ' + err);
        } else {
            res.json(user);
        }
    });
});

/* Update user */
router.put('/:id', auth, function(req, res) {
    var ID = req.params.id;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;

    if (req.body.profilePic) {
        bucketService.addImageToBucket(req.body.profilePic).then(function(response) {
            User.findOne({_id: ID}, function(err, user) {
                user.update({ firstName: firstName, lastName: lastName, username: username, profilePic: response.url }, function(err, user) {
                    if (err) {
                        res.status(500).send('Could not update user. Error: ' + err);
                    } else {
                        res.json(user);
                    }
                });
            });
        }, function(err) {
            console.log('bucketService.addImageToBucket(): ' + err);
        });
    } else {
        User.findOne({_id: ID}, function(err, user) {
            user.update({ firstName: firstName, lastName: lastName, username: username }, function(err, user) {
                if (err) {
                    res.status(500).send('Could not update user. Error: ' + err);
                } else {
                    res.json(user);
                }
            });
        });
    }
});

/* Delete user */
router.delete('/:id', auth, function(req, res) {
    var ID = req.params.id;

    User.findOne({_id: ID}, function(err, user) {
        user.remove(function(err) {
            if (err) {
                res.status(500).send('Could not delete user. Error: ' + err);
            } else {
                res.status(200).send('User deleted.');
            }
        });
    });
});

module.exports = router;
