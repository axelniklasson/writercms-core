var mongoose = require('mongoose');

var SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Boolean, required: true, default: true }
});

module.exports = mongoose.model('Settings', SettingSchema);
