var User = require('../models/user');
var request = require('request');

var notifier = {};

/*
* Notifies all users.
*/
notifier.notifyAll = function(subject, text) {
    User.find({ receiveNotifications: true }, function(err, users) {
        if (err) {
            // Handle error in some way?
        } else {
            var emails = [];
            for (var i = 0; i < users.length; i++) {
                emails[i] = users[i].email;
            }
            notifier.sendMail(emails, subject, text);
        }
    });
};

/*
* Notifies all users found in the users array (of IDs) sent as an argument.
*/
notifier.notify = function(users, subject, text) {
    User.find({ receiveNotifications: true , _id: { $in: users }}, function(err, users) {
        if (err) {
            // Handle error in some way?
        }
        var emails = [];
        for (var i = 0; i < users.length; i++) {
            emails[i] = users[i].email;
        }

        notifier.sendMail(emails, subject, text);
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
            'Token': process.env.MAILMAN_TOKEN
        },
        body: {
            from: 'WriterCMS notifier <mailman@axelniklasson.se>',
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
