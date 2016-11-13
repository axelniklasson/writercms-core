var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var markdown = require('../etc/markdown');
var fs = require('fs');
var crypto = require('crypto');
var gcloud = require('gcloud');
var google = require('googleapis');
var stream = require('stream');
var url = require("url");
var path = require("path");
var auth = require('../etc/authentication');
var moment = require('moment');

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

    Post.find({ categories: { $all: categories } }).populate('author').sort({ date: -1 }).exec(function(err, posts) {
        if (err) {
            res.status(500).send('Could not get posts. Error: ' + err);
        } else {
            res.json(posts);
        }
    });
});

/* Create a new post */
router.post('/', auth, function(req, res) {
    google.auth.getApplicationDefault(function (err, authClient) {
        if (err) {
            console.log(err);
        } else {
            if (authClient.createScopedRequired &&
                authClient.createScopedRequired()) {
              authClient = authClient.createScoped(
                  ['https://www.googleapis.com/auth/devstorage.read_write']);
            }

            var storage = gcloud.storage({
              projectId: 'writer',
              auth: authClient
            });
            var bucket = storage.bucket('writer-images');

            var title = req.body.title;
            var slug = slugify(title);
            var content = req.body.content;
            var images = req.body.images;
            var authorID = req.body.author;
            var categories = req.body.categories;
            var location = req.body.location;
            var imageLinks = [];

            for (var i = 0; i < images.length; i++) {
                var base64string = images[i];
                var imageBytes = base64string.split(',')[1];
                var imageType = base64string.split(';')[0].split(':')[1];
                var extension = imageType.split('/')[1];

                var imageString = new Buffer(imageBytes, 'base64').toString('binary');

                var timestamp = moment().format() + '_' + (i + 1);
                var fileName = timestamp + '.' + extension;

                var tempStorage = './';
                fs.writeFileSync(tempStorage + fileName, imageBytes, 'base64');
                imageLinks[i] = 'https://storage.googleapis.com/writer-images/' + fileName;

                var file = bucket.file(fileName);
                var stream = file.createWriteStream({
                    metadata: {
                        contentType: imageType,
                        predefinedAcl: 'publicRead',
                        metadata: {
                            custom: 'metadata'
                        }
                    }
                });

                var file = fs.readFileSync(tempStorage + fileName);

                stream.on('error', function(err) {
                    fs.unlink(tempStorage + fileName);
                });

                stream.on('finish', function() {
                    fs.unlink(tempStorage + fileName);
                });

                stream.end(file);
            }

            Post.create({ title: title, slug: slug, content: content, images: imageLinks, author: authorID,
            categories: categories, location: location }, function(err, post) {
                if (err) {
                    res.status(500).send('Could not create post. Error: ' + err);
                } else {
                    res.json(post);
                }
            });
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

    Post.findOne({_id: ID}, function(err, post) {
        // Logic for when images are removed/attached to/from post
        if (images.length != post.images.length) {
            google.auth.getApplicationDefault(function (err, authClient) {
                if (err) {
                    console.log(err);
                } else {
                    if (authClient.createScopedRequired &&
                        authClient.createScopedRequired()) {
                      authClient = authClient.createScoped(
                          ['https://www.googleapis.com/auth/devstorage.read_write']);
                    }

                    var storage = gcloud.storage({
                      projectId: 'writer',
                      auth: authClient
                    });
                    var bucket = storage.bucket('writer-images');

                    if (images.length > post.images.length) {
                        // Add images to bucket
                        var distincts = images.filter(function(obj) { return post.images.indexOf(obj) == -1; });
                        for (var i = 0; i < distincts.length; i++) {
                            var base64string = distincts[i];
                            var imageBytes = distincts[i].split(',')[1];
                            var imageType = distincts[i].split(';')[0];
                            imageType = imageType.split(':')[1];
                            var extension = imageType.split('/')[1];

                            var imageString = new Buffer(imageBytes, 'base64').toString('binary');

                            var timestamp = moment().format() + '_' + (i + 1);
                            var fileName = timestamp + '.' + extension;

                            var tempStorage = './';
                            fs.writeFileSync(tempStorage + fileName, imageBytes, 'base64');
                            images = post.images;
                            images.push('https://storage.googleapis.com/writer-images/' + fileName);

                            var file = bucket.file(fileName);
                            var stream = file.createWriteStream({
                                metadata: {
                                    contentType: imageType,
                                    predefinedAcl: 'publicRead',
                                    metadata: {
                                        custom: 'metadata'
                                    }
                                }
                            });

                            var path = tempStorage + fileName;
                            var file = fs.readFileSync(path);

                            handleCreatedImage(stream, file, path);
                        }

                        post.update({ title: title, slug: slug, content: content, categories: categories,
                            images: images }, function(err, post) {
                            if (err) {
                                res.status(500).send('Could not update post. Error: ' + err);
                            } else {
                                res.json(post);
                            }
                        });

                    } else {
                        // Remove from bucket
                        var distincts = post.images.filter(function(obj) { return images.indexOf(obj) == -1; });
                        for (var i = 0; i < distincts.length; i++) {
                            var image = distincts[i];
                            var parts = image.split('/');
                            var fileName = parts[parts.length - 1];
                            var file = bucket.file(fileName);
                            file.delete(function(err, apiResponse) {
                                if (err != null)
                                    console.log("Deletion of GCS file " + fileName + "failed.");
                            });
                        }

                        post.update({ title: title, slug: slug, content: content, categories: categories,
                            images: images }, function(err, post) {
                            if (err) {
                                res.status(500).send('Could not update post. Error: ' + err);
                            } else {
                                res.json(post);
                            }
                        });
                    }
                }
            });
        } else {
            post.update({ title: title, slug: slug, content: content, categories: categories,
                images: images }, function(err, post) {
                if (err) {
                    res.status(500).send('Could not update post. Error: ' + err);
                } else {
                    res.json(post);
                }
            });
        }
    });
});

function handleCreatedImage(stream, file, path) {
    var self = {
        stream: stream,
        file: file,
        path: path
    };

    self.stream.on('error', function(err) {
        fs.unlink(tempStorage + fileName);
    });

    self.stream.on('finish', function() {
        fs.unlink(self.path);
    });

    self.stream.end(file);
}

router.post('/like/:id', function(req, res) {
    var ID = req.params.id;
    Post.findOne({_id: ID}, function(err, post) {
        post.likes >= 1 ? likes = post.likes + 1 : likes = 1;
        post.update({ likes: likes }, function(err, post) {
            res.json(post);
        });
    });
});

/* Delete post */
router.delete('/:id', auth, function(req, res) {
    var ID = req.params.id;

    Post.findOne({_id: ID}, function(err, post) {
        post.remove(function(err) {
            if (err) {
                res.status(500).send('Could not delete post. Error: ' + err);
            } else {
                google.auth.getApplicationDefault(function (err, authClient) {
                        if (err) {
                        console.log(err);
                    } else {
                        if (authClient.createScopedRequired &&
                            authClient.createScopedRequired()) {
                        authClient = authClient.createScoped(
                            ['https://www.googleapis.com/auth/devstorage.read_write']);
                        }

                        var storage = gcloud.storage({
                            projectId: 'writer',
                            auth: authClient
                        });

                        var bucket = storage.bucket('writer-images');

                        post.images.forEach(function(link) {
                            var parsedUrl = url.parse(link);
                            var fileName = path.basename(parsedUrl.pathname);
                            bucket.file(fileName).delete(function(err, apiResponse) {
                                if (err != null)
                                    console.log("Deletion of GCS file " + fileName + "failed.");
                            });
                        }, this);
                    }
                });
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
