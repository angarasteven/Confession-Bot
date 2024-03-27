// models/Confession.js
const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
    confessionId: Number,
    confession: String,
    author: String,
    responses: [String],
});

const Confession = mongoose.model('Confession', confessionSchema);

module.exports = Confession;