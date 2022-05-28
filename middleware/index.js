const User = require('../models/UserModel')
const multipleUpload = require('./upload')

const getUser = (req, res, next) => {
    const username = req.session.username
    User.findOne({ username: username })
        .then(account => {
            if (account)
                req.getUser = account
            next()
        })
}

const roleResetPassword = (req, res, next) => {
    const username = req.session.username
    User.findOne({ username: username })
        .then(account => {
            if (!account.active)
                next()
            else
                res.redirect('/user/logout')
        })
}

const roleLogin = (req, res, next) => {
    if (!req.session.username)
        next()
    else
        res.redirect('/user/logout')
}

const failAccess = (req,res,next) => {
    if (req.failAccess >= 1) {
        req.flash('error', 'Tài khoản bị khóa 1 phút')
        setTimeout(() => {
            next()
        }, 1000);
    } else {
        next()
    }
}

module.exports = {
    getUser,
    multipleUpload,
    roleResetPassword,
    roleLogin,
    failAccess,
}