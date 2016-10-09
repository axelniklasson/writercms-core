var request = require('supertest');
var chai = require('chai');
var server = require('../../api/server');
var authenticationHandler = require('./authenticationHandler');

var _id;

describe('Create post without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .post('/posts')
        .set('Content-Type', 'application/json')
        .send({ title: 'Foo', content: 'Bar', images: [] })
        .expect(401, done());
    });
});

describe('Create post', function() {
    it('should return 200 and a created post', function(done) {
        request(server)
        .post('/posts')
        .set('Content-Type', 'application/json')
        .set('Token', authenticationHandler.token)
        .send({ title: 'Foo', content: 'Bar', images: [] })
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body.title).to.equal('Foo');
            chai.expect(res.body.content).to.equal('Bar');
            chai.expect(res.body.images).to.be.empty;

            // Save _id to use for other tests
            _id = res.body._id;
            done();
        });
    });
});

describe('Get posts', function() {
    it('should return 200 and a list of posts', function(done) {
        request(server)
        .get('/posts')
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            done();
        });
    });
});

describe('Get post by ID', function() {
    it('should return 200 and a post', function(done) {
        request(server)
        .get('/posts/' + _id)
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body._id).to.equal(_id);
            chai.expect(res.body.title).to.equal('Foo');
            chai.expect(res.body.content).to.equal('Bar');
            chai.expect(res.body.images).to.be.empty;
            done();
        });
    });
});

describe('Update post without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .put('/posts/' + _id)
        .set('Content-Type', 'application/json')
        .send({ title: 'Bar', content: 'Baz', images: [] })
        .expect(401, done());
    });
});

describe('Update post', function() {
    it('should return 200 and an updated post', function(done) {
        request(server)
        .put('/posts/' + _id)
        .set('Content-Type', 'application/json')
        .set('Token', authenticationHandler.token)
        .send({ title: 'Bar', content: 'Baz', images: [] })
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body.ok).to.equal(1);
            chai.expect(res.body.nModified).to.equal(1);
            done();
        });
    });
});

describe('Delete post without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .delete('/posts/' + _id)
        .expect(401, done());
    });
});

describe('Delete post', function() {
    it('should return 401', function(done) {
        request(server)
        .delete('/posts/' + _id)
        .set('Token', authenticationHandler.token)
        .expect(200, done());
    });
});
