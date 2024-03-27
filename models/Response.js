// models/Response.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    confessionId: Number,
    response: String,
    author: String,
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;