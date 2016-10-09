var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var auth = require('../etc/authentication.js');

/* Get all categories */
router.get('/', function(req, res) {
    Category.find({}).sort({ name: 1 }).exec(function(err, categories) {
        if (err) {
            res.status(500).send('Could not get categories. Error: ' + err);
        } else {
            res.json(categories);
        }
    });
});

/* Get category by ID */
router.get('/:id', function(req, res) {
    var ID = req.params.id;
    Category.findOne({_id: ID}, function(err, category) {
        if (err) {
            res.status(500).send('Could not get category. Error: ' + err);
        } else {
            res.json(category);
        }
    });
});

/* Create a new category */
router.post('/', auth, function(req, res) {
    if (req.body.name) {
        var name = req.body.name;
        Category.create({ name: name }, function(err, category) {
            if (err) {
                res.status(500).send('Could not create category. Error: ' + err);
            } else {
                res.json(category);
            }
        });
    } else {
        res.status(400).send('Bad request. Error: ' + err);
    }
});

/* Update post */
router.put('/:id', auth, function(req, res) {
    var ID = req.params.id;
    var name = req.body.name

    Category.update({_id: ID}, { name: name }, function(err, category) {
        if (err) {
            res.status(500).send('Could not update category. Error: ' + err);
        } else {
            res.json(category);
        }
    });
});

/* Delete post */
router.delete('/:id', auth, function(req, res) {
    var ID = req.params.id;

    Category.findOne({_id: ID}).remove(function(err) {
        if (err) {
            res.status(500).send('Could not remove category. Error: ' + err);
        } else {
            res.status(200).send('Category deleted.');
        }
    });
});

module.exports = router;
