var request = require('supertest');
var server = require('../../api/server');

describe('API base endpoint', function() {
    it('should return 200', function(done) {
        request(server)
        .get('/')
        .expect(200, done());
    });
});

describe('API 404 handler', function() {
    it('should return 404', function(done) {
        request(server)
        .get('/does/not/exist')
        .expect(404, done());
    });
});
