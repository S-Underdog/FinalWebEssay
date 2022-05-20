const User = require('../models/UserModel')

module.exports = (req, res, next) => {
    const username = req.user.username
    User.findOne({ username: username })
        .then(account => {
            if (!account.active)
                res.redirect('/user/resetPassword')
            else
                next()
        })
}

