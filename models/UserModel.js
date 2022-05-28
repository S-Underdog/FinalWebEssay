const mongoose = require('mongoose')
const Schema = mongoose.Schema


const UserSchema = new Schema({
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
    },
    birth: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    frontID: {
        type: String,
        required: true,
    },
    backID: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Not_verified"
    },
    failAccess: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    history: {
        type: [
            {
                trade_id: String,
                action: String,
                amount: Number,
                fee: Number,
                receive_code: String,
                note: String,
                createdAt: Date,
                status: String,
            }
        ]
    }
})

module.exports = mongoose.model('User', UserSchema)