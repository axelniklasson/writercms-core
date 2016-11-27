var User = require('../models/user');
var request = require('request');
var mailmanToken = require('./mailman');

var notifier = {};

/*
* Notifies all users that want to receive email notificaitons.
*/
notifier.notifyUsers = function(subject, text) {
    User.find({ receiveNotifications: true }, function(err, users) {
        if (err) {
            // Handle error
        } else {
            // Loop through users and collect their email
            var emails = [];
            for (var i = 0; i < users.length; i++) {
                emails[i] = users[i].email;
            }
            notifier.sendMail(emails, subject, text);
        }
    });
};

/*
 * Sends an email using mailman.
 */
notifier.sendMail = function(users, subject, text)  {
    var opts = {
        url: 'https://mailman.axelniklasson.se',
        method: 'POST',
        headers: {
            'Token': mailmanToken
        },
        body: {
            from: 'WriterCMS notifier <noreply@resa.axelniklasson.se>',
            to: users,
            subject: subject,
            text: text
        },
        json: true
    };
    
    request(opts, function(error, response, body) {
        if (!error) {
            // Mails sent
        } else {
            // Handle error in some awesome way
            console.log(error);
        }
    });
}

module.exports = notifier;
