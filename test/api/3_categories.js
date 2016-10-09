var request = require('supertest');
var chai = require('chai');
var server = require('../../api/server');
var authenticationHandler = require('./authenticationHandler');

var _id;

describe('Create category without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .post('/categories')
        .set('Content-Type', 'application/json')
        .send({ name: 'Foo'})
        .expect(401, done());
    });
});

describe('Create category', function() {
    it('should return 200 and a created category', function(done) {
        request(server)
        .post('/categories')
        .set('Content-Type', 'application/json')
        .set('Token', authenticationHandler.token)
        .send({ name: 'Foo' })
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body.name).to.equal('Foo');

            // Save _id to use for other tests
            _id = res.body._id;
            done();
        });
    });
});

describe('Create category with non-unique name', function() {
    it('should return 200 and a created category', function(done) {
        request(server)
        .post('/categories')
        .set('Content-Type', 'application/json')
        .set('Token', authenticationHandler.token)
        .send({ name: 'Foo' })
        .expect(500, done());
    });
});

describe('Get categories', function() {
    it('should return 200 and a list of categories', function(done) {
        request(server)
        .get('/categories')
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            done();
        });
    });
});

describe('Get category by ID', function() {
    it('should return 200 and a category', function(done) {
        request(server)
        .get('/categories/' + _id)
        .expect(200)
        .expect('Content-Type', 'application/json')
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body._id).to.equal(_id);
            chai.expect(res.body.name).to.equal('Foo');
            done();
        });
    });
});

describe('Update category without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .put('/categories/' + _id)
        .set('Content-Type', 'application/json')
        .send({ title: 'Bar', content: 'Baz', images: [] })
        .expect(401, done());
    });
});

describe('Update category', function() {
    it('should return 200 and an updated category', function(done) {
        request(server)
        .put('/categories/' + _id)
        .set('Content-Type', 'application/json')
        .set('Token', authenticationHandler.token)
        .send({ name: 'Bar' })
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

describe('Delete category without auth', function() {
    it('should return 401', function(done) {
        request(server)
        .delete('/categories/' + _id)
        .expect(401, done());
    });
});

describe('Delete category', function() {
    it('should return 200', function(done) {
        request(server)
        .delete('/categories/' + _id)
        .set('Token', authenticationHandler.token)
        .expect(200, done());
    });
});
