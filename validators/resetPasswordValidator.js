const { check } = require('express-validator')
const User = require('../models/UserModel')
const bcrypt = require('bcrypt')

module.exports = [
    check('newPass')
        .exists().withMessage('Vui lòng nhập mật khẩu mới')
        .notEmpty().withMessage('Không được bỏ trống mật khẩu mới')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới không hợp lệ')
        .custom((value, { req }) => {
            const username = req.session.username
            return User.findOne({ username: username })
                .then(account => {
                    return bcrypt.compare(value, account.password)
                })
                .then(match => {
                    if (match)
                        throw new Error('Mật khẩu trùng với mật khẩu cũ')
                    return true
                })
        }),

    check('rePass')
        .exists().withMessage('Vui lòng xác nhận mật khẩu mới')
        .notEmpty().withMessage('Vui lòng xác nhận mật khẩu mới')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới không hợp lệ')
        .custom((value, { req }) => {
            if (value != req.body.newPass)
                throw new Error('Mật khẩu xác nhận không khớp')
            return true
        }),

]