var google = require('googleapis');
var gcloud = require('gcloud');
var moment = require('moment');
var fs = require('fs');

var bucketService = {
    initialized: false,
    bucketName: 'writer-images',
    bucket: null,
    authClient: null
};

bucketService.init = function() {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
        if (this.initialized) {
            resolve();
        }

        google.auth.getApplicationDefault(function (err, authClient) {
            if (err) {
                console.log(err);
                this.initialized = false;
                reject(err);
            } else {
                if (authClient.createScopedRequired && authClient.createScopedRequired()) {
                    authClient = authClient.createScoped(['https://www.googleapis.com/auth/devstorage.read_write']);
                    this.authClient = authClient;
                }

                var storage = gcloud.storage({
                    projectId: 'writer',
                    auth: authClient
                });
                this.bucket = storage.bucket(self.bucketName);
                this.initialized = true;
                resolve();
            }
        });
    });

    return promise;
}

bucketService.addImageToBucket = function(base64String) {
    var returnPromise = this.init().then(function(response) {
        var self = this;

        var promise = new Promise(function(resolve, reject) {
            var imageBytes = base64String.split(',')[1];
            var imageType = base64String.split(';')[0].split(':')[1];
            var extension = imageType.split('/')[1];
            var imageString = new Buffer(imageBytes, 'base64').toString('binary');
            var timestamp = moment().format();
            var fileName = timestamp + '.' + extension;
            var tempStorage = './';
            fs.writeFileSync(tempStorage + fileName, imageBytes, 'base64');

            var file = self.bucket.file(fileName);
            var stream = file.createWriteStream({
                metadata: {
                    contentType: imageType,
                    predefinedAcl: 'publicRead',
                    metadata: {
                        custom: 'metadata'
                    }
                }
            });

            stream.on('error', function(err) {
                reject(err);
                deleteFile(tempStorage + fileName);
            });

            stream.on('finish', function() {
                resolve({ url: 'https://storage.googleapis.com/' + self.bucket.name + '/' + fileName });
                deleteFile(tempStorage + fileName);
            });

            stream.end(fs.readFileSync(tempStorage + fileName));
        });

        return promise;
    }, function(err) {
        console.log('bucketService.init(): ' + err);
    });

    return returnPromise;
}

function deleteFile(path) {
    fs.stat(path, function(err, stat) {
        if(err == null) {
            fs.unlink(path);
        }
    });
}

module.exports = bucketService;
