var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    post: { type: mongoose.Schema.ObjectId, ref: 'Post' },
    read: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('Comment', CommentSchema);
