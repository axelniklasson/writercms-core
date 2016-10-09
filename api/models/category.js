var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Category', CategorySchema);