var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var Post = require('../models/post');
var auth = require('../etc/authentication.js');

/* Get all comments */
router.get('/', function(req, res) {
    Comment.find({}).sort({ date: -1 }).exec(function(err, comments) {
        if (err) {
            res.status(500).send('Could not get comments. Error: ' + err);
        } else {
            res.json(comments);
        }
    });
});

/* Get comment by ID */
router.get('/:id', function(req, res) {
    var ID = req.params.id;
    Comment.findOne({_id: ID}, function(err, comment) {
        if (err) {
            res.status(500).send('Could not get comment. Error: ' + err);
        } else {
            res.json(comment);
        }
    });
});

/* Create a new comment */
router.post('/', function(req, res) {
    var userName = req.body.userName;
    var content = req.body.content;
    var post = req.body.post;

    Comment.create({ userName: userName, content: content, post: post }, function(err, comment) {
        if (err) {
            res.status(500).send('Could not create comment. Error: ' + err);
        } else {
            Post.update({_id: post}, { $push: { 'comments': comment } }, function(err, post) {
                if (err) {
                    res.status(500).send('Could not update post related to comment. Error: ' + err);
                } else {
                    res.json(comment);
                }
            });
        }
    });
});

/* Mark comment as read */
router.post('/markasread/:id', auth, function(req, res) {
    var ID = req.params.id;

    Comment.update({_id: ID}, { read: true }, function(err, comment) {
        if (err) {
            res.status(500).send('Could not update comment. Error: ' + err);
        } else {
            res.status(200).send('Comment marked as read.');
        }
    });
});

/* Update comment */
router.put('/:id', auth, function(req, res) {
    var ID = req.params.id;
    var userName = req.body.userName;
    var content = req.body.content;

    Comment.update({_id: ID}, { userName: userName, content: content }, function(err, comment) {
        if (err) {
            res.status(500).send('Could not update comment. Error: ' + err);
        } else {
            res.json(comment);
        }
    });
});

/* Delete comment */
router.delete('/:id', auth, function(req, res) {
    var ID = req.params.id;

    Comment.findOne({_id: ID}).remove(function(err) {
        if (err) {
            res.status(500).send('Could not remove comment. Error: ' + err);
        } else {
            res.status(200).send('comment deleted.');
        }
    });
});

module.exports = router;
