const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTP = new Schema({
    otp: {
        type: String,
        required: true,
        maxlength: 6
    },
    verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60
    }
})

module.exports = mongoose.model('OTP', OTP);