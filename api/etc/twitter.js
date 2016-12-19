var Twit = require('twit');
var credentials = require('../../config/twitter');

var T = new Twit(credentials);

module.exports = {
    tweet: function(status) {
        T.post('statuses/update', { status: status }, function(err, data, response) {
            if (!err) {
                // Tweet sent
            } else {
                console.log(err); // Handle error in some way?
            }
        });
    }
}
