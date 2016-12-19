var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var markdown = require('../etc/markdown');
var auth = require('../etc/authentication');
var moment = require('moment');
var bucketService = require('../etc/bucketService');
var notifier = require('../etc/notifier.js');
var twitter = require('../etc/twitter');

/* Get all posts */
router.get('/', function(req, res) {
    var take = parseInt(req.query.take);
    var skip = parseInt(req.query.skip);

    Post.find({}).populate('author').populate('categories').populate({ path: 'comments', options: { sort: { date: -1 } } }).skip(skip).limit(take).sort({ date: -1 }).exec(function(err, posts) {
        if (err) {
            res.status(500).send('Could not get posts. Error: ' + err);
        } else {
            res.json(posts);
        }
    });
});

/* Get all posts with skip/take functionality */
router.get('/list', function(req, res) {
    var take = parseInt(req.query.take);
    var skip = parseInt(req.query.skip);

    Post.find({}, '_id title').skip(skip).limit(take).sort({ date: -1 }).exec(function(err, posts) {
        if (err) {
            res.status(500).send('Could not get posts. Error: ' + err);
        } else {
            res.json(posts);
        }
    });
});

/* Get all post locations */
router.get('/locations', function(req, res) {
    Post.find({ location: { $exists: true } }, 'title slug author location date').populate('author').sort({ date: -1 }).exec(function(err, posts) {
        if (err) {
            res.status(500).send('Could not get posts. Error: ' + err);
        } else {
            res.json(posts);
        }
    });
});

/* Filter posts */
router.get('/filter', function(req, res) {
    var categories = req.query.category;
    var authors = req.query.author;

    if (authors && categories) {
        Post.find({ categories: { $all: categories }, author: { $in: authors } }).populate('author').sort({ date: -1 }).exec(function(err, posts) {
            if (err) {
                res.status(500).send('Could not get posts. Error: ' + err);
            } else {
                res.json(posts);
            }
        });
    } else if (categories) {
        Post.find({ categories: { $all: categories } }).populate('author').sort({ date: -1 }).exec(function(err, posts) {
            if (err) {
                res.status(500).send('Could not get posts. Error: ' + err);
            } else {
                res.json(posts);
            }
        });
    } else if (authors) {
        Post.find({ author: { $in: authors } }).populate('author').sort({ date: -1 }).exec(function(err, posts) {
            if (err) {
                res.status(500).send('Could not get posts. Error: ' + err);
            } else {
                res.json(posts);
            }
        });
    } else {
        Post.find({}).populate('author').sort({ date: -1 }).exec(function(err, posts) {
            if (err) {
                res.status(500).send('Could not get posts. Error: ' + err);
            } else {
                res.json(posts);
            }
        });
    }
});

/* Create a new post */
router.post('/', auth, function(req, res) {
    var title = req.body.title;
    var slug = slugify(title);
    var content = req.body.content;
    var images = req.body.images;
    var authorID = req.body.author;
    var categories = req.body.categories;
    var location = req.body.location;
    var postToTwitter = req.body.postToTwitter;

    bucketService.addImagesToBucket(images, function(imageLinks, err) {
        if (!err) {
            Post.create({ title: title, slug: slug, content: content, images: imageLinks, author: authorID,
            categories: categories, location: location }, function(err, post) {
                if (err) {
                    res.status(500).send('Could not create post. Error: ' + err);
                } else {
                    res.json(post);

                    // Publish post if created at resa.axelniklasson.se and share to twitter is set
                    var origin = req.get('origin');
                    if (postToTwitter && (origin === 'http://resa.axelniklasson.se' || origin === 'https://resa.axelniklasson.se')) {
                        twitter.tweet(domain + '/posts/' + post.year + '/' + post.month + '/' + post.slug);
                    }
                }
            });
        } else {
            res.status(500).send('Could not add images to bucket. Error: ' + err);
        }
    });
});

/* Get post by ID */
router.get('/:id', function(req, res) {
    var ID = req.params.id;
    Post.findOne({_id: ID}).populate('author').populate('categories').populate({ path: 'comments', options: { sort: { date: -1 } } }).exec(function(err, post) {
        if (err) {
            res.status(500).send('Could not get post. Error: ' + err);
        } else {
            res.json(post);
        }
    });
});

/* Get post by date and slug */
router.get('/:year/:month/:slug', function(req, res) {
    var year = req.params.year,
        month = req.params.month,
        slug = req.params.slug,
        startDate = new Date(year, month - 1, 1),
        endDate = new Date(year, month, 1);

    Post.findOne({'slug': slug}).where('date').gte(startDate).lt(endDate).populate('author')
        .populate('categories').populate({ path: 'comments', options: { sort: { date: -1 } } })
        .exec(function(err, post) {
            if (err) {
                res.status(500).send('Could not get post. Error: ' + err);
            } else {
                res.json(post);
            }
    });
});

/* Update post */
router.put('/:id', auth, function(req, res) {
    var ID = req.params.id;
    var title = req.body.title;
    var slug = slugify(title);
    var content = req.body.content;
    var categories = req.body.categories;
    var images = req.body.images;
    var location = req.body.location;

    Post.findOne({_id: ID}, function(err, post) {
        // Logic for when images are removed/attached to/from post
        if (images.length != post.images.length) {
            // Images are attached to post
            if (images.length > post.images.length) {
                var attachedImages = images.filter(function(obj) { return post.images.indexOf(obj) == -1; });
                bucketService.addImagesToBucket(attachedImages, function(imageLinks, err) {
                    if (!err) {
                        // Add new imagelinks to existing images
                        var updatedImages = post.images.concat(imageLinks);

                        post.update({ title: title, slug: slug, content: content, categories: categories,
                            images: updatedImages, location: location }, function(err, post) {
                            if (err) {
                                res.status(500).send('Could not update post. Error: ' + err);
                            } else {
                                res.json(post);
                            }
                        });
                    } else {
                        res.status(500).send('Could not add images. Error: ' + err);
                    }
                })
            } else {
                // Images are removed from post
                var removedImages = post.images.filter(function(obj) { return images.indexOf(obj) == -1; });
                bucketService.removeImagesFromBucket(removedImages);

                post.update({ title: title, slug: slug, content: content, categories: categories,
                    images: images, location: location }, function(err, post) {
                    if (err) {
                        res.status(500).send('Could not update post. Error: ' + err);
                    } else {
                        res.json(post);
                    }
                });
            }
        } else {
            post.update({ title: title, slug: slug, content: content, categories: categories,
                images: images, location: location }, function(err, post) {
                if (err) {
                    res.status(500).send('Could not update post. Error: ' + err);
                } else {
                    res.json(post);
                }
            });
        }
    });
});

/* Register post like */
router.post('/like/:id', function(req, res) {
    var ID = req.params.id;
    Post.findOne({_id: ID}, function(err, post) {
        post.likes >= 1 ? likes = post.likes + 1 : likes = 1;
        // Stash author and post title for notifying on success
        var author = post.author, title = post.title;
        post.update({ likes: likes }, function(err, post) {
            if (err) {
                res.status(500).send('Could not like post. Error: ' + err);
            } else {
                notifier.notify([author], 'Ny like', 'Någon likeade precis ditt inlägg \"' + title + '\".');
                res.json(post);
            }
        });
    });
});

/* Delete post */
router.delete('/:id', auth, function(req, res) {
    var ID = req.params.id;

    Post.findOne({_id: ID}, function(err, post) {
        var images = post.images;
        post.remove(function(err) {
            if (err) {
                res.status(500).send('Could not delete post. Error: ' + err);
            } else {
                bucketService.removeImagesFromBucket(images);
                res.status(200).send('Post deleted.');
            }
        });
    });
});

/*
* Thanks to Ben McMahen
* http://blog.benmcmahen.com/post/41122888102/creating-slugs-for-your-blog-using-expressjs-and
*/
function slugify(text) {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

module.exports = router;
