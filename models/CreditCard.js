const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreditCardSchema = new Schema({
    card_no: {
        type: String,
        required: true,
        maxlength: 6,
        unique: true,
    },
    expired: {
        type: Date,
        required: true,
    },
    cvv_code: {
        type: String,
        required: true,
        maxlength: 3,
    },
    balance: {
        type: Number,
        default: 0
    },
    note: {
        type: String
    }
    
})

module.exports = mongoose.model('CreditCardSchema', CreditCardSchema);