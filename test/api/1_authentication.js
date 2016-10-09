var request = require('supertest');
var chai = require('chai');
var server = require('../../api/server');
var authenticationHandler = require('./authenticationHandler');

describe('Login with bad credentials', function() {
    it('should return 401', function(done) {
        request(server)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({ username: 'userthatdoesnotexist', password: 'password' })
        .expect(401, done());
    });
});

describe('Login', function() {
    it('should return 200 and a token', function(done) {
        request(server)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({ username: 'testadmin', password: 'testpassword' })
        .expect(200)
        .end(function(err, res) {
            chai.expect(res.body).to.not.be.empty;
            chai.expect(res.body.token).to.not.be.empty;

            // Save token to use later on
            authenticationHandler.token = res.body.token;
            done();
        });
    });
});
