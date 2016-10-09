var fs = require('fs');

process.env.DB_DEV_URL = '';
process.env.DB_TEST_URL = '';
process.env.DB_PROD_URL = '';
process.env.TOKEN_SECRET = '';
process.env.GOOGLE_AUTH = '';

fs.writeFileSync('./config/google-auth.json', process.env.GOOGLE_AUTH, 'utf-8');
