var Category = require('../api/models/category');
var Post = require('../api/models/post');

before(function(done) {
    emptyDatabase(done);
});

after(function(done) {
    emptyDatabase(done);
});

function emptyDatabase(done) {
    Post.remove({}, function() {
        Category.remove({}, function() {
            console.log('Database cleared.');
            done();
        });
    });
}
