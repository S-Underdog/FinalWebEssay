const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Provider = new Schema({
    provider_name: {
        type: String,
        required: true,
        unique: true
    },
    provider_code: {
        type: String,
        required: true,
        unique: true,
        maxlength: 5
    }
})

module.exports = mongoose.model('Provider', Provider);