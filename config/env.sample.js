var fs = require('fs');

process.env.DB_DEV_URL = 'mongodb://host:port/writer';
process.env.DB_TEST_URL = 'mongodb://username:pw@host:port/writer-tests';
process.env.DB_PROD_URL = 'mongodb://username:pw@host:port/writer';
process.env.TOKEN_SECRET = 'some-secret';
process.env.GOOGLE_AUTH = 'google-auth'
