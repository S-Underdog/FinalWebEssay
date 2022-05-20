const { check } = require('express-validator')
const User = require('../models/UserModel')

module.exports = [
    check('email')
        .exists().withMessage('Vui lòng nhập địa chỉ email')
        .notEmpty().withMessage('Email không được bỏ trống')
        .isEmail().withMessage('Email không hợp lệ'),

    check('fullname')
        .exists().withMessage('Vui lòng nhập họ và tên')
        .notEmpty().withMessage('Không được bỏ trống họ và tên')
        .isLength({ min: 6 }).withMessage('Tên không hợp lệ'),

    check('phone')
        .exists().withMessage('Vui lòng nhập số điện thoại')
        .notEmpty().withMessage('Không được để trống số điện thoại')
        .isMobilePhone().withMessage('Số điện thoại không hợp lệ'),

    check('birth')
        .exists().withMessage('Vui lòng nhập ngày tháng năm sinh')
        .notEmpty().withMessage('Không được để trống ngày tháng năm sinh')
        .isDate().withMessage('Ngày tháng năm sinh không hợp lệ'),

    check('address')
        .exists().withMessage('Vui lòng nhập địa chỉ')
        .notEmpty().withMessage('Không được bỏ trống địa chỉ')
        .isLength({ min: 6 }).withMessage('Địa chỉ không hợp lệ'),

    check('email')
        .custom(value => {
            return User.findOne({ email: value }).then(user => {
                if (user)
                    throw new Error('Email đã tồn tại')
                return true
            })
        }),

    check('phone')
        .custom(value => {
            return User.findOne({ phone: value }).then(user => {
                if (user)
                    throw new Error('Số điện thoại đã tồn tại')
                return true
            })
        })

]