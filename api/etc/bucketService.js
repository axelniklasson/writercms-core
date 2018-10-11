var { Storage } = require('@google-cloud/storage');
var moment = require('moment');
var fs = require('fs');

var bucketService = {
    initialized: false,
    bucketName: 'writer-images',
    bucket: null
};

bucketService.init = function() {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
        if (this.initialized) {
            resolve();
        }

	this.bucket = storage.bucket(this.bucketName);
	this.initialized = true;
    });

    return promise;
}

bucketService.addImagesToBucket = function(images, cb) {
    var imageLinks = [];
    if (!this.initialized) {
        this.init().then(function(response) {
            addImages(images);
        });
    } else {
        addImages(images);
    }

    function addImages(images) {
        for (var i = 0; i < images.length; i++) {
            var base64String = images[i];
            var imageBytes = base64String.split(',')[1];
            var imageType = base64String.split(';')[0].split(':')[1];
            var extension = imageType.split('/')[1];
            var imageString = new Buffer(imageBytes, 'base64').toString('binary');
            var timestamp = moment().format() + '_' + i;
            var fileName = timestamp + '.' + extension;
            var tempStorage = './';
            fs.writeFileSync(tempStorage + fileName, imageBytes, 'base64');
            var file = this.bucket.file(fileName);

            // Stash bucket and image links
            var bucket = this.bucket;
            imageLinks.push('https://storage.googleapis.com/' + bucket.name + '/' + fileName);

            var stream = file.createWriteStream({
                metadata: {
                    contentType: imageType,
                    predefinedAcl: 'publicRead'
                }
            });

            var filePath = tempStorage + fileName;
            handleCreatedImage(stream, fs.readFileSync(filePath), filePath);
        }

        // Assume images are uploaded correctly
        cb(imageLinks, null);
    }
}

bucketService.removeImagesFromBucket = function(images) {
    if (!this.initialized) {
        this.init().then(function(response) {
            removeImages(images);
        });
    } else {
        removeImages(images);
    }

    function removeImages(images) {
        for (var i = 0; i < images.length; i++) {
            var parts = images[i].split('/');
            var fileName = parts[parts.length - 1];
            var file = this.bucket.file(fileName);
            file.delete(function(err, response) {
                if (err != null) {
                    console.log('Deletion of bucket file ' + fileName + ' failed.'); // Handle this?
                }
            });
        }
    }
}

function handleCreatedImage(stream, file, path) {
    var self = {
        stream: stream,
        file: file,
        path: path
    };

    self.stream.on('error', function(err) {
        fs.stat(self.path, function(err, stat) {
            if(err == null) {
                fs.unlink(path);
            }
        });
    });

    self.stream.on('finish', function() {
        fs.stat(self.path, function(err, stat) {
            if(err == null) {
                fs.unlink(path);
            }
        });
    });

    self.stream.end(file);
}

module.exports = bucketService;
