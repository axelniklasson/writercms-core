var mongoose = require('mongoose');
var passwordHash = require('password-hash');

var UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true, dropDups: true },
    profilePic: { type: String },
    password: { type: String, required: true }
});

UserSchema.pre('save', function(next) {
    this.password = passwordHash.generate(this.password);
    next();
});

UserSchema.methods.toJSON = function() {
	var obj = this.toObject();
	delete obj.password;
	return obj;
}

module.exports = mongoose.model('User', UserSchema);
