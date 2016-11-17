var mongoose = require('mongoose');

var SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});

module.exports = mongoose.model('Settings', SettingSchema);
