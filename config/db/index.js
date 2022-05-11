const mongoose = require('mongoose')
require('dotenv').config()

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Connect to DB successful')
    } catch (error) {
        console.log('Connect Fail')
    }
}

module.exports = { connect }